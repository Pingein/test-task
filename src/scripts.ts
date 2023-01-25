import { createRow, removeAllChildren, alertMessage, SortDiv, isOdd } from './assets/libs/helper'
import { Style, Player, AxiosParameters } from './assets/libs/interfaces'
import axios from 'axios'


const sort_containers = document.querySelectorAll<SortDiv>('.sort__container')

const page_size_input = document.querySelector<HTMLInputElement>('.page-size-input')
const table = document.querySelector<HTMLTableElement>(".table")

const next_page_btn = document.querySelector<HTMLDivElement>('.buttons__next')
const prev_page_btn = document.querySelector<HTMLDivElement>('.buttons__previous')
const new_player_btn = document.querySelector<HTMLDivElement>('.buttons__new-player')
const search_btn = document.querySelector<HTMLDivElement>('.buttons__search')

const URL = 'http://localhost:3003/players'

let page_length = +page_size_input.value
let current_page = 1
let max_pages:number
let parameters:AxiosParameters = {_sort: "id", _order: "asc"}


const writeRowsFromDB = async (url:string, table:HTMLTableElement,
                                params: AxiosParameters) => {
                                    
    let result = await axios.get<Player[]>(url, {params: params})
                            .catch(err => alertMessage(err))
    if (result) {
        max_pages = Math.ceil(+result.headers['x-total-count']/page_length)

        let current_row = 1
        result.data.forEach((player:Player) => {

            let style:Style
            isOdd(current_row) ? style={backgroundColor: '#F5F5F7'} : style={backgroundColor: 'white'}

            let row = createRow(table, [player.name,
                                        player.email,
                                        player.age+'',
                                        player.password,
                                        `<div class="button-container">
                                            <div class="edit button">EDIT</div>
                                            <div class="delete button">DELETE</div>
                                        </div>`], style)
            row.querySelector('.delete').addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete')) {
                    await axios.delete(URL+`/${player.id}`)
                    reloadTable(table, url, {...parameters, _page:current_page, _limit:page_length})
                }
            })

            row.querySelector('.edit').addEventListener('click', () => {
                createPlayerEditMenu(url, player.id,
                                    player.name,
                                    player.email,
                                    player.age,
                                    player.password)
            })
            current_row += 1
        })
        document.querySelector('.page__total').innerHTML = ''+max_pages
    }
}

const reloadTable = async (table:HTMLTableElement, url:string, 
                            params:AxiosParameters) => { 
    let y_pos = window.scrollY
    removeAllChildren(document.querySelector('tbody'))
    document.querySelector('.page__current').innerHTML = ''+current_page
    await writeRowsFromDB(url, table, {...params, _page:current_page, _limit:page_length})
    window.scrollTo(0, y_pos)
}

const createPlayerEditMenu = async (url:string,
                                    id?:number, name?:string,
                                    email?: string, age?:number,
                                    password?:string) => {

    document.querySelector('.editor') && document.querySelector('.editor').remove()

    let menu = document.createElement('div')

    menu.innerHTML = `
    <div class="editor">
        <span class="editor__player-id">
            ${id ? `Player ID: ${id}` : 'Adding new Player'}
        </span>
        
        <input type="text"
            class="editor__player-name"
            placeholder="Enter Player Name"
            value="${name || ''}">
        <input type="text"
            class="editor__player-email"
            placeholder="Enter Player Email"
            value="${email || ''}">
        <input type="number"
            class="editor__player-age"
            placeholder="Enter Player Age"
            value="${age || ''}">
        <input type="text"
            class="editor__player-password"
            placeholder="Enter Player Password"
            value="${password || ''}">

        <div class="accept button">ACCEPT</div>
        <div class="cancel button">CANCEL</div>
    </div>`

    menu.querySelector('.accept').addEventListener('click', async () => {
        name = menu.querySelector<HTMLInputElement>('.editor__player-name').value
        email = menu.querySelector<HTMLInputElement>('.editor__player-email').value
        age = +menu.querySelector<HTMLInputElement>('.editor__player-age').value
        password = menu.querySelector<HTMLInputElement>('.editor__player-password').value

        let player:Player = {name: name, email:email, age:age, password:password}

        if (!id && name && email && age && password) {
            await axios.post(url+'/', player)
                        .catch(err => alert(err))

            menu.remove()
            reloadTable(table, URL, {...parameters, _page:current_page, _limit:page_length})
        } 
        else if (name && email && age && password) {
            await axios.patch(url+`/${id}`, player)
                        .catch(err => alert(err))

            menu.remove()
            reloadTable(table, url, {...parameters, _page:current_page, _limit:page_length})
        } 
        else {
            alertMessage('Please fill all fields')
        }
    })
    menu.querySelector<HTMLDivElement>('.cancel').addEventListener('click', () => {
        menu.remove()
    })
    document.body.appendChild(menu)
}

const sortTable = (url:string, table:HTMLTableElement, div:SortDiv) => {
    sort_containers.forEach((el) => {
        if (el === div) {
            if (el.order) {
                parameters = {_sort:el.value, _order:el.order}  
            } else {
                parameters = {_sort: 'id', _order:'asc'}
            }
            reloadTable(table, url, {...parameters, _page:current_page, _limit:page_length})  
        } 
        else {
            el.order = undefined
            el.querySelector('.sort__order').innerHTML = '…'        
        }
    })
}


// saliek sortDiviem value un eventlistenrus
sort_containers.forEach((el) => {
    el.value = el.classList[el.classList.length-1]
    el.addEventListener('click', () => {
        if (el.order === undefined) {
            el.order = 'asc'
            el.querySelector('.sort__order').innerHTML = '↑'
        } else if (el.order === 'asc') {
            el.order = 'desc'
            el.querySelector('.sort__order').innerHTML = '↓'
        } else {
            el.order = undefined
            el.querySelector('.sort__order').innerHTML = '…'
        }
        sortTable(URL, table, el)
    })
})


next_page_btn.addEventListener('click', () => {
    if (current_page+1 > max_pages) {
        return
    }
    current_page+=1
    reloadTable(table, URL, {...parameters, _page:current_page, _limit:page_length})
})

prev_page_btn.addEventListener('click', () => {
    if (current_page-1 === 0) {
        return
    }
    current_page-=1
    reloadTable(table, URL, {...parameters, _page:current_page, _limit:page_length})
})

page_size_input.addEventListener('input', () => {
    if (+page_size_input.value) {
        page_length = +page_size_input.value
        reloadTable(table, URL, {...parameters, _page:current_page, _limit:page_length})    
    }
})

new_player_btn.addEventListener('click', () => {
    createPlayerEditMenu(URL)
})

search_btn.addEventListener('click', () => {
    if (document.querySelector('.search-bar')) {
        return
    }
    let search_bar = document.createElement('div')
    search_bar.className = 'search-bar'
    let search_input = document.createElement('input')
    let search_close_btn = document.createElement('div')
    search_close_btn.className = 'button cancel'
    search_close_btn.innerHTML = 'X'

    let pre_search_params = parameters
    
    search_input.addEventListener('input', () => {
        if (search_input.value) {
            parameters = {...parameters, q:search_input.value}
            reloadTable(table, URL, {...parameters, _page:current_page, _limit:page_length})
        }
    })
    search_close_btn.addEventListener('click', () => {
        search_bar.remove()
        parameters = {...pre_search_params,  _page:current_page, _limit:page_length} // janomaina uz ieprieksejiem
        reloadTable(table, URL, {...parameters, _page:current_page, _limit:page_length})

    })
    search_bar.appendChild(search_input)
    search_bar.appendChild(search_close_btn)
    document.body.appendChild(search_bar)
})



writeRowsFromDB(URL, table, {...parameters, _page:current_page, _limit:page_length})