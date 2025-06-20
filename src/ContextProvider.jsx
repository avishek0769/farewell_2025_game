import React, { createContext, useState } from 'react'

export const Context = createContext()

function ContextProvider({ children }) {
    const [socket, setSocket] = useState(null)

    let defaultValue = {
        socket,
        setSocket
    }

    return (
        <Context.Provider value={defaultValue}>
            {children}
        </Context.Provider>
    )
}

export default ContextProvider