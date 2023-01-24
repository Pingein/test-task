import { createRow, removeAllChildren } from './assets/libs/helper'
import axios from 'axios'


const page_size_input = document.querySelector<HTMLInputElement>('.page__size-input')
const table:HTMLTableElement = document.querySelector<HTMLTableElement>(".table")

const next_page_btn:HTMLDivElement = document.querySelector<HTMLDivElement>('.buttons__next')
const prev_page_btn:HTMLDivElement = document.querySelector<HTMLDivElement>('.buttons__previous')
const new_player_btn: HTMLDivElement = document.querySelector<HTMLDivElement>('.buttons__new-player')

const URL = 'http://localhost:3003/players'

let page_length = +page_size_input.value
let current_page = 1
let max_pages:number

interface Player {
    id: number
    name: string
    email: string
    password: string
    age: number
}


const writeRowsFromDB = async (url:string, table:HTMLTableElement,
                          current_page:number, page_length:number) => {

    let result = await axios.get(url+`?_page=${current_page}&_limit=${page_length}`)

    max_pages = Math.ceil(+result.headers['x-total-count']/page_length)

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

const reloadTable = (table:HTMLTableElement, url:string, 
                     current_page:number, page_length:number) => {
    removeAllChildren(document.querySelector('tbody'))
    document.querySelector('.page__current').innerHTML = ''+current_page
    return writeRowsFromDB(url, table, current_page, page_length)
}

const createPlayerEditMenu = async (URL:string,
                                    id?:number, name?:string,
                                    email?: string, age?:number,
                                    password?:string) => {

    document.querySelector('.editor') && document.querySelector('.editor').remove()

    let menu = document.createElement('div')

    menu.innerHTML = `
    <div class="editor">
        <span class="editor__player-id">
            ${id ? `Player ID: ${id}` : 'Creating new Player'}
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

        if (!id && name && email && age && password) {
            await axios.post(URL+'/', {
                name: name,
                email: email,
                age: age,
                password: password
            })
            menu.remove()
            reloadTable(table, URL, current_page, page_length)
        } 
        else if (name && email && age && password) {
            await axios.patch(URL+`/${id}`, {
                name: name,
                email: email,
                age: age,
                password: password
            })
            menu.remove()
            reloadTable(table, URL, current_page, page_length)
        } 
        else {
            alert('Please fill all fields')
        }
    })
    menu.querySelector<HTMLDivElement>('.cancel').addEventListener('click', () => {
        menu.remove()
    })
    document.body.appendChild(menu)
}


next_page_btn.addEventListener('click', () => {
    if (current_page+1 > max_pages) {
        return
    }
    current_page+=1
    reloadTable(table, URL, current_page, page_length)
})

prev_page_btn.addEventListener('click', () => {
    if (current_page-1 === 0) {
        return
    }
    current_page-=1
    reloadTable(table, URL, current_page, page_length)
})

page_size_input.addEventListener('input', () => {
    if (+page_size_input.value) {
        page_length = +page_size_input.value
        reloadTable(table, URL, current_page, page_length)    
    }
})

new_player_btn.addEventListener('click', () => {
    createPlayerEditMenu(URL)
})



writeRowsFromDB(URL, table, current_page, page_length)
