import axios from 'axios'

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

const rowsFromDB = async (url:string, table:HTMLTableElement,
                          current_page:number, page_length:number) => {
    let data = await axios.get(url+`?_page=${current_page}&_limit=${page_length}`).then(res => res.data)
    data.forEach((player:Player) => {
        let row = createRow(table, [player.name,
                                    player.email,
                                    player.age+'',
                                    player.password,
                                    `<div class="button-container">
                                        <div class="edit button">EDIT</div>
                                        <div class="delete button">DELETE</div>
                                    </div>`])
        row.querySelector('.delete').addEventListener('click', () => {
            axios.delete(URL+`/${player.id}`)
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
}

const reloadTable = (table:HTMLTableElement, url:string, current_page:number, page_length:number) => {
    removeAllChildren(document.querySelector('tbody'))
    document.querySelector('.page__current').innerHTML = ''+current_page
    rowsFromDB(url, table, current_page, page_length)
}

const createRow = (table:HTMLTableElement, data:string[]) => {
    let row = document.createElement('tr')
    data.forEach(text => {
        let row_cell = document.createElement('td')
        row_cell.innerHTML = text
        row.appendChild(row_cell)
    })
    table.querySelector('tbody').appendChild(row)
    return row
}

const removeAllChildren = (el:HTMLElement) => {
    let children = [...el.childNodes]
    children.forEach(el => el.remove())
}

const createPlayerEditMenu = (URL:string,
                              id:number, name?:string,
                              email?: string, age?:number,
                              password?:string) => {
    let menu = document.createElement('div')
    menu.innerHTML = `
    <div class="editor">
        <span class="editor__player-id">
            player ID: ${id}
        </span>

        <input type="text"
                class="editor__player-name"
                placeholder="Enter Player Name"
                value="${name}">

        <input type="text"
                class="editor__player-email"
                placeholder="Enter Player Email"
                value="${email}">

        <input type="number"
                class="editor__player-age"
                placeholder="Enter Player Age"
                value="${age}">

        <input type="text"
                class="editor__player-password"
                placeholder="Enter Player Password"
                value="${password}">

        <div class="accept button">ACCEPT</div>
    </div>`

    menu.querySelector('.accept').addEventListener('click', () => {
        axios.patch(URL+`/${id}`, {
            name: menu.querySelector<HTMLInputElement>('.editor__player-name').value,
            email: menu.querySelector<HTMLInputElement>('.editor__player-email').value,
            age: menu.querySelector<HTMLInputElement>('.editor__player-age').value,
            password: menu.querySelector<HTMLInputElement>('.editor__player-password').value
        })
        menu.remove()
        document.location.reload()
    })

    document.body.appendChild(menu)
}

export { sortDiv, createRow, removeAllChildren, 
         createPlayerEditMenu, reloadTable, rowsFromDB }