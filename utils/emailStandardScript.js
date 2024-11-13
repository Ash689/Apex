async function header(){
    return `
        <style>
            .header {
                background-color: #ffffff;
                border-bottom: 2px solid #cccccc;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                transition: top 1s ease, transform 1s ease;
                height: auto;
                text-align: center;
                position:absolute;
                /* margin-top: 20px; */
                margin-top: 2%;
                left: 0%;
                width: 350px;
            }
            @font-face {
                font-family: 'Dancing Script';
                src: url('../fonts/DancingScript-VariableFont_wght.ttf') format('truetype');
            }

            .header h1 a {
                font-family: 'Dancing Script', sans-serif;
                font-size: 38px;
                color: #dc143c; 
                text-decoration: none;
                margin: 0;
            }
        </style>

        <div class="header">
            <h1><a href=${process.env.URL}" class="animated-text">Apex Tuition</a></h1>
            <div id="welcome-message" class="welcome-message"></div>
        </div>
    `
}

async function footer(){
    return `
        <style>
            p{
                margin-top: 20px;
                font-family: 'Dancing Script', sans-serif;
                font-size: 14px;
                color: #dc143c; 
                text-decoration: none;
            }
        </style>
        <footer>
            <p>Apex Tuition</p>
        </footer>
    `
}

async function button(buttonText, link){
    return `
        <style>
            button {
                background-color: #dc143c;
                color: #ffffff;
                font-size: 14px;
                border: none;
                cursor: pointer;
                font-weight: 600;
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            button:hover {
                background-color: #9d1a34;
                color: #efefef;
            }

            button:active {
                background-color: #4d0c19;
                color: #efefef;
            }
        </style>

        <form action="${process.env.URL}/${link}" method="GET">
            <button type="submit">${buttonText}</button>
        </form>
    `
}

module.exports = {header, footer, button};