import React from "react";
import { Link} from 'react-router-dom';

const MenuButton = (resetFunction) => {
    return (
        <Link className = 'linkButton' to = '/' onClick={resetFunction}>Back to Menu</Link>
    )
}

export default MenuButton;