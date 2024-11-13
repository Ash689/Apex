async function header(){
    return `
        <div style="background-color: #ffffff; border-bottom: 2px solid #cccccc; text-align: center; width: 100%; max-width: 600px; margin: 0 auto;">
            <h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #dc143c; margin: 20px 0;">Apex Tuition</h1>
        </div>

        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
    `
}

async function footer(){
    return `
        </div>
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

       <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <form action="${process.env.URL}/${link}" method="GET">
                        <button type="submit" style="
                            background-color: #dc143c;
                            color: #ffffff;
                            font-size: 14px;
                            border: none;
                            font-weight: 600;
                            padding: 10px 20px;
                            border-radius: 5px;
                            display: inline-block;
                            text-align: center;
                            text-decoration: none;">
                            ${buttonText}
                        </button>
                    </form>
                </td>
            </tr>
        </table>

    `
}

module.exports = {header, footer, button};