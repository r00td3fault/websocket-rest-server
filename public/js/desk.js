
const pendindLabel = document.querySelector('#lbl-pending');
const deskHeader = document.querySelector('h1');
const ticketAlert = document.querySelector('div.alert');
const btnDraw = document.querySelector('#btn-draw');
const btnFinish = document.querySelector('#btn-finish');
const currentTicketLabel = document.querySelector('small');


const searchParams = new URLSearchParams( window.location.search );

if ( !searchParams.has('escritorio') ){
    window.location = 'index.html';
    throw new Error('Escritorio es requerido');
}

const deskNumber = searchParams.get('escritorio');
deskHeader.innerHTML = deskNumber;
let workingTicket = null;

function checkTicketCount( currentCount = 0 ) {
    if ( currentCount === 0 ) {
        ticketAlert.classList.remove('d-none');
    }else{
        ticketAlert.classList.add('d-none');
    }
    
    pendindLabel.innerHTML = currentCount;
}


async function loadInitialCount() {
    const pending = await fetch('/api/ticket/pending').then( resp => resp.json());
    
    checkTicketCount(pending.length);
}


async function getTicket() {
    await finishTicket();
    const { status, ticket, message } = await fetch(`/api/ticket/draw/${ deskNumber }`)
        .then( resp => resp.json() );

    if ( status === 'error' ) {
        currentTicketLabel.innerHTML = message;
        return;
    }

    workingTicket = ticket;
    currentTicketLabel.innerHTML = ticket.number;

}

async function finishTicket() {
    if ( !workingTicket ) return;
    const { status, message } = await fetch(`/api/ticket/done/${workingTicket.id}`, {
        method: 'PUT'
    }).then( resp => resp.json() );

    console.log( { status, message } )

    if ( status === 'ok' ) {
        workingTicket = null;
        currentTicketLabel.innerHTML = 'Nadie';
    }

}

function connectToWebSockets() {

    const socket = new WebSocket( 'ws://localhost:3000/ws' );
  
    socket.onmessage = ( event ) => {
        const { type, payload } = JSON.parse(event.data);
        if ( type !== 'on-ticket-count-changed' ) return;
        checkTicketCount(payload);
        
    };
  
    socket.onclose = ( event ) => {
      console.log( 'Connection closed' );
      setTimeout( () => {
        console.log( 'retrying to connect' );
        connectToWebSockets();
      }, 1500 );
  
    };
  
    socket.onopen = ( event ) => {
      console.log( 'Connected' );
    };
  
}
  

  
  
btnDraw.addEventListener('click', getTicket);
btnFinish.addEventListener('click', finishTicket);


loadInitialCount();
connectToWebSockets();