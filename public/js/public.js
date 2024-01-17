
function renderTickets( tickets) {

    if( tickets.length === 0 ) return;
    tickets.forEach((ticket,index) => {
        const ticketLabel = document.querySelector(`#lbl-ticket-0${index+1}`);
        const deskLabel = document.querySelector(`#lbl-desk-0${index+1}`);

        ticketLabel.innerText = `Ticket ${ticket.number}`;
        deskLabel.innerText = `Desk ${ticket.handleAtDesk}`;
    });
}

async function getWorkingTickets() {

    const workingTickets = await fetch('/api/ticket/working-on').then( resp => resp.json() );
    renderTickets(workingTickets);

    console.log(workingTickets);

}







function connectToWebSockets() {

    const socket = new WebSocket( 'ws://localhost:3000/ws' );
  
    socket.onmessage = ( event ) => {
        const { type, payload } = JSON.parse(event.data);
        if ( type !== 'on-working-changed' ) return;
        console.log('en trabajo', payload);
        renderTickets(payload);
        
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



getWorkingTickets();
connectToWebSockets();