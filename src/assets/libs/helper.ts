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


export { createRow, removeAllChildren }