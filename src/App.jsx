import { useState } from 'react'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import Landing from './screens/Landing';
import Room from './screens/Room';
import Match from './screens/Match';
import Result from './screens/Result';

let router = createBrowserRouter([
    {
        path: "/",
        Component: Landing,
    },
    {
        path: "/room",
        Component: Room,
    },
    {
        path: "/match",
        Component: Match,
    },
    {
        path: "/result",
        Component: Result,
    }
]);


function App() {
    const [count, setCount] = useState(0)

    return (
        <RouterProvider router={router} />
    )
}

export default App
