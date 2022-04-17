let user;
let lastMessage;
let adresssee = "Todos";
let visibility = "Público";
let visibilityText = "publicamente"

function showSideBar() {
    document.querySelector(".dark-background").classList.remove("removed");
    document.querySelector(".side-bar").classList.add("show-side-bar"); // alterar nome
}

function hideSideBar() {
    document.querySelector(".dark-background").classList.add("removed");
    document.querySelector(".side-bar").classList.remove("show-side-bar"); // alterar nome

}


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
    if(message.to === user.name || message.from === user.name) {
        return true;
    }

    return false;
}

function sendMessage(btn) {

    const message = {
        from: user.name,
        to: adresssee,
        text: btn.parentNode.querySelector("input").value,
        type: visibility === "Público" ? "message" : "private_message",
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

    let indexLastMessage;
    let lastMessageHour;
    
    if(lastMessage !== undefined) {
        lastMessageHour = messages.find(message => message.time === lastMessage.time);
        indexLastMessage = messages.indexOf(lastMessageHour) + 1;
        
    } else {
        indexLastMessage = 0;
        
    }

    let filterMessages = messages.slice(indexLastMessage, messages.length);
    
    for(let i = 0; i < filterMessages.length; i++) {

        if(i === filterMessages.length - 1) {
            lastMessage = filterMessages[i];
        }

        switch(filterMessages[i].type) {
            case "status":
                addEntraceStatus(filterMessages[i], messageType);
                break;
            case "message":
                messageType = "";
                addConversationMessage(filterMessages[i], messageType);
                break;
                case "private_message":
                    messageType = "reserved";
                    console.log(verifyReservedAdressee(filterMessages[i]));
                if(verifyReservedAdressee(filterMessages[i])) {
                    console.log("olá");
                    addConversationMessage(filterMessages[i], messageType)
                    console.log(filterMessages[i]);
                }
                break;
            default:
                break;    
        }

    }

    if(filterMessages.length !== 0) {
        document.querySelector(".message:last-child").scrollIntoView();

    }
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

function listOnlineParticipants(participants) {
    const listParticipants = document.querySelector(".participants-list");

    listParticipants.innerHTML = `
        <div class="participant" onclick="selectAdressee(this)">
            <div>
                <ion-icon name="people"></ion-icon>
                <p>Todos</p>
            </div>
            <ion-icon name="checkmark-sharp" class="check-icon visible"></ion-icon>
        </div>
        `;
        
    for(let i = 0; i < participants.length; i++) {
        listParticipants.innerHTML += `
            <div class="participant" onclick="selectAdressee(this)">
                <div>
                    <ion-icon name="people"></ion-icon>
                    <p>${participants[i].name}</p>
                </div>
                <ion-icon name="checkmark-sharp" class="check-icon"></ion-icon>
            </div>
        `;
    }

}

function verifyOnlineParticipants() {
    const promiseParticipants = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

    promiseParticipants.then(function (response) {
        const participants = response.data;
        listOnlineParticipants(participants);
    });
}

function selectAdressee(participantContainer) {
    document.querySelector(".participants-list .check-icon.visible").classList.remove("visible");
    participantContainer.querySelector(".check-icon").classList.add("visible");

    adresssee = participantContainer.querySelector("p").innerHTML;

    document.querySelector(".bottom-bar p").innerHTML = `Enviando para ${adresssee} (${visibilityText})`;
}

function selectVisibility(visibilityContainer) {
    document.querySelector(".visibility-option .check-icon.visible").classList.remove("visible");
    visibilityContainer.querySelector(".check-icon").classList.add("visible");
    
    visibility = visibilityContainer.querySelector("p").innerHTML;
    visibilityText = visibility === "Público" ? "publicamente" : "reservadamente";

    document.querySelector(".bottom-bar p").innerHTML = `Enviando para ${adresssee} (${visibilityText})`;
}

function initializeSite() {
    document.querySelector(".login-view").classList.add("removed");

    setInterval(loadMessages, 3000);
    setInterval(keepConected, 4000);
    setInterval(verifyOnlineParticipants, 10000);

    loadMessages();
    verifyOnlineParticipants();
}


function verifyUser() { 
    
    const nome = document.querySelector(".login-view input").value;

    user = {
        name: nome,
    };

    const promiseLogin = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", user);

    promiseLogin.then(initializeSite);

    promiseLogin.catch(function (err) {
        if(err.response.status === 400) {
            document.querySelector(".user-warning").classList.add("visible");

            document.querySelector(".login-view input").value = "";

        }
    });

}

const inputMessage = document.querySelector(".bottom-bar input");

inputMessage.addEventListener("keyup", function(e) {
    if(e.code === "Enter") {
       const sendBtn = document.querySelector(".bottom-bar ion-icon");
       sendMessage(sendBtn);

    }
});