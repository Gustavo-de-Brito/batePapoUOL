// Pegar paricipantes


let user;

// mensagens

function addEntraceStatus(message) {

    document.querySelector(".messages").innerHTML += `
        <div class="message entrace-status">
            <p class="message-text">
                <span class="hour">(${message.time})</span>
                <span class="sender">${message.from}</span>
                ${message.text}
            </p>
        </div>
        `;
}
            
function addConversationMessage(message, messageType) {

    document.querySelector(".messages").innerHTML += `
    <div class="message ${messageType}">
        <p class="message-text">
            <span class="hour">(${message.time})</span>
            <span class="sender">${message.from}</span>
            para
            <span class="adresssee">${message.to}</span>
            ${message.text}
        </p>
    </div>
    `;
}

function verifyReservedAdressee(message) {
    if(message.to === user) {
        return true;
    }

    return false;
}

function sendMessage(btn) {

    const message = {
        from: user.name,
        to: "Todos",
        text: btn.parentNode.querySelector("input").value,
        type: "message"
    }

    btn.parentNode.querySelector("input").value = "";
    
    const promissePostMessage = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", message);

    promissePostMessage.then(loadMessages);
    promissePostMessage.catch(function (err) {
        console.log(`Erro no envio da mensagem: ${err.response.status}`);
    });
}

function setMessageStatus(response) {
    const messages = response.data;
    let messageType = "";
    
    for(let i = 0; i < messages.length; i++) {
        switch(messages[i].type) {
            case "status":
                addEntraceStatus(messages[i], messageType);
                break;
            case "message":
                messageType = "";
                addConversationMessage(messages[i], messageType);
                break;
                case "private_message":
                    messageType = "reserved";
                if(verifyReservedAdressee(messages[i])) {
                    addConversationMessage(messages[i], messageType)
                }
                break;
            default:
                break;    
        }

    }
    document.querySelector(".message:last-child").scrollIntoView();
}

function loadMessages() {
    
    const promiseMessages = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    
    promiseMessages.then(setMessageStatus);
}

function keepConected() {
    const promiseConected = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", user);
    
    promiseConected.catch(function (err) {
        console.log(`Erro ao tentar manter a conexão: ${err.response.status}`);
    });
}

function verifyOnlineParticipants() {
    const promiseParticipants = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

    promiseParticipants.then(function(response) {
        console.log(response.data);
    });

}

function initializeSite() {
    setInterval(loadMessages, 3000);
    setInterval(keepConected, 4000);
    //setInterval(verifyOnlineParticipants, 5000);
}


function verifyUser() { 
    
    user = {
        name: prompt("Digite o seu nome de usuário"),
    };

    const promiseLogin = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", user);

    promiseLogin.then(initializeSite);

    promiseLogin.catch(function (err) {
        if(err.response.status === 400) {
            alert("Nome de usuário já existe, insira outro");
            verifyUser();

        }
    });

}



verifyUser();