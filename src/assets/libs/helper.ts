import { Style } from "./interfaces"


class SortDiv extends HTMLDivElement {
    order: 'asc' | 'desc' | undefined
    value: string
}


const isOdd = (n:number) => {
    return !(n%2)
}


const createRow = (table:HTMLTableElement, data:string[], styleOptions?:Style) => {
    let row = document.createElement('tr')
    if (styleOptions) {
        Object.keys(styleOptions).forEach((option) => {
            row.style[option as keyof Style] = styleOptions[option as keyof Style]
        })
    }
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


const alertMessage = (text:string) => {
    document.querySelector('.message-alert') && document.querySelector('.message-alert').remove()

    let message_container = document.createElement('div')
    message_container.className = 'message-alert'
    message_container.innerHTML = text

    let close_btn = document.createElement('div')
    close_btn.className = 'message-close button'
    close_btn.innerHTML = 'OK'
    close_btn.addEventListener('click', () => {
        message_container.remove()
    })
    message_container.appendChild(close_btn)

    document.body.appendChild(message_container)
}


export { SortDiv, createRow, removeAllChildren, alertMessage, isOdd }