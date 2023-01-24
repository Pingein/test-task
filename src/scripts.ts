//import { sortDiv, createRow, removeAllChildren, createPlayerEditMenu, reloadTable, rowsFromDB } from "./assets/libs/helper";
import axios from 'axios'


// vars
const page_size_input = document.querySelector<HTMLInputElement>('.page__size-input')
const sort_containers:NodeListOf<sortDiv> = document.querySelectorAll<sortDiv>('.sort__container')
const table:HTMLTableElement = document.querySelector<HTMLTableElement>(".table")

const next_page_btn:HTMLDivElement = document.querySelector<HTMLDivElement>('.buttons__next')
const prev_page_btn:HTMLDivElement = document.querySelector<HTMLDivElement>('.buttons__previous')
const new_player_btn: HTMLDivElement = document.querySelector<HTMLDivElement>('.buttons__new-player')

interface Player {
    id: number
    name: string
    email: string
    password: string
    age: number
}

class sortDiv extends HTMLDivElement {
    order: 'ascending' | 'descending' | undefined
}


// fns
// ielade rindas no datubazes
const rowsFromDB = async (url:string, table:HTMLTableElement,
                          current_page:number, page_length:number) => {

    let result = await axios.get(url+`?_page=${current_page}&_limit=${page_length}`)

    let max_pages =   Math.ceil(+result.headers['x-total-count']/page_length)

    result.data.forEach((player:Player) => {
        let row = createRow(table, [player.name,
                                    player.email,
                                    player.age+'',
                                    player.password,
                                    `<div class="button-container">
                                        <div class="edit button">EDIT</div>
                                        <div class="delete button">DELETE</div>
                                    </div>`])
        row.querySelector('.delete').addEventListener('click', async () => {
            await axios.delete(URL+`/${player.id}`)
            reloadTable(table, url, current_page, page_length)
        })
        row.querySelector('.edit').addEventListener('click', () => {
            createPlayerEditMenu(url, player.id,
                                 player.name,
                                 player.email,
                                 player.age,
                                 player.password)
        })
    })

    document.querySelector('.page__total').innerHTML = ''+max_pages
}


// parlade tabulu, neparladejot lapu
const reloadTable = (table:HTMLTableElement, url:string, current_page:number, page_length:number) => {
    removeAllChildren(document.querySelector('tbody'))
    document.querySelector('.page__current').innerHTML = ''+current_page
    return rowsFromDB(url, table, current_page, page_length)
}


// izveido tabula rindu kur data ir rindas sunas
const createRow = (table:HTMLTableElement, data:string[]):HTMLTableRowElement => {
    let row = document.createElement('tr')
    data.forEach(text => {
        let row_cell = document.createElement('td')
        row_cell.innerHTML = text
        row.appendChild(row_cell)
    })
    table.querySelector('tbody').appendChild(row)
    return row
}


//parent elementam izdzes visus child nodus
const removeAllChildren = (el:HTMLElement) => {
    let children = [...el.childNodes]
    children.forEach(el => el.remove())
}


// lauj editot un taisit playerus
const createPlayerEditMenu = async (URL:string,
                                    id?:number, name?:string,
                                    email?: string, age?:number,
                                    password?:string) => {

    let menu = document.createElement('div')

    menu.innerHTML = `
    <div class="editor">
        <span class="editor__player-id">
            ${id ? `id: ${id}` : 'Creating new Player'}
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
    </div>`

    menu.querySelector('.accept').addEventListener('click', async () => {
        name = menu.querySelector<HTMLInputElement>('.editor__player-name').value
        email = menu.querySelector<HTMLInputElement>('.editor__player-email').value
        age = +menu.querySelector<HTMLInputElement>('.editor__player-age').value
        password = menu.querySelector<HTMLInputElement>('.editor__player-password').value

        if (!id && name && email && age && password) {
            await axios.post(URL+'/', {
                name: name,
                email: email,
                age: age,
                password: password
            })
            menu.remove()
            reloadTable(table, URL, current_page, page_length)
        } else if (id && name && email && age && password) {
            await axios.patch(URL+`/${id}`, {
                name: menu.querySelector<HTMLInputElement>('.editor__player-name').value,
                email: menu.querySelector<HTMLInputElement>('.editor__player-email').value,
                age: menu.querySelector<HTMLInputElement>('.editor__player-age').value,
                password: menu.querySelector<HTMLInputElement>('.editor__player-password').value
            })
            menu.remove()
            reloadTable(table, URL, current_page, page_length)
        } else {
            alert('fill all')
        }
    })
    document.body.appendChild(menu)
}


//event listeneri
// nakama lapa
next_page_btn.addEventListener('click', () => {
    current_page+=1
    reloadTable(table, URL, current_page, page_length)
})

// iepriekseja lapa
prev_page_btn.addEventListener('click', () => {
    if (current_page-1 === 0) {
        return
    }
    current_page-=1
    reloadTable(table, URL, current_page, page_length)
})

// kad page size input zaude fokusu , refresho tabulu
page_size_input.addEventListener('focusout', () => {
    page_length = +page_size_input.value
    reloadTable(table, URL, current_page, page_length)
})

new_player_btn.addEventListener('click', () => {
    createPlayerEditMenu(URL)
    //createPlayerCreateMenu(URL)
})



const URL = 'http://localhost:3003/players'
let page_length = +page_size_input.value
let current_page = 1

rowsFromDB(URL, table, current_page, page_length)
