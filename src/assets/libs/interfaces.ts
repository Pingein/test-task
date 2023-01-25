interface Style {
    backgroundColor?: string
    color?: string
}

interface Player {
    id?: number
    name: string
    email: string
    password: string
    age: number
}

interface AxiosParameters {
    _page?: number
    _limit?: number
    _sort?: string
    _order?: "desc" | "asc"
    q?: string
}

export { Style, Player, AxiosParameters }