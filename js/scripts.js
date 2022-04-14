// Pegar paricipantes
const promiseParticipants = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

promiseParticipants.then(function(response) {
    console.log(response.data);
});

// status

/*
const promiseStatus = axios.get("https://mock-api.driven.com.br/api/v6/uol/status");

promiseStatus.then(function(response) {
    console.log(response.data);
});
*/

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
        <div class="message">
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
            default:
                console.log(messages[i]);
        }
        
    }

    document.querySelector(".message:last-child").scrollIntoView();
}

function loadMessages() {
    const promiseMessages = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    
    promiseMessages.then(setMessageStatus);
}



loadMessages();