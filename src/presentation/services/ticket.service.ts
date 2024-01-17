import { Ticket } from '../../domain/interfaces/ticket';
import { UuidAdapter } from '../../config/uuid.adapter';
import { WssService } from './wss.services';



export class TicketService {

    constructor(
        private readonly wsService = WssService.instance,
    ) { }

    public tickets: Ticket[] = [
        { id: UuidAdapter.v4(), number: 1, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 2, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 3, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 4, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 5, createdAt: new Date(), done: false },
        { id: UuidAdapter.v4(), number: 6, createdAt: new Date(), done: false },
    ];

    private readonly workingOnTickets: Ticket[] = [];


    public get pendindTickets(): Ticket[] {
        return this.tickets.filter(ticket => !ticket.handleAtDesk);
    }

    public get lastWorkingOnTickets(): Ticket[] {
        return this.workingOnTickets.slice(0, 4);
    }

    public get lastTicketNumber(): number {
        return this.tickets.length > 0 ? this.tickets.at(-1)!.number : 0;
    }

    public createTicket() {

        const ticket: Ticket = {
            id: UuidAdapter.v4(),
            number: this.lastTicketNumber + 1,
            createdAt: new Date(),
            done: false,
            handleAt: undefined,
            handleAtDesk: undefined,
        }

        this.tickets.push(ticket);
        this.onTicketNumberChanged();

        return ticket;
    }

    public drawTicket(desk: string) {

        const ticket = this.tickets.find(t => !t.handleAtDesk);
        if (!ticket) return { status: 'error', message: 'No hay tickets pendientes' };

        ticket.handleAtDesk = desk;
        ticket.handleAt = new Date();

        this.workingOnTickets.unshift({ ...ticket });
        this.onTicketNumberChanged();
        this.onWorkingOnChanged();

        return { status: 'ok', ticket };
    }


    public onFinishedTicket(id: string) {
        const ticket = this.tickets.find(t => t.id === id);
        if (!ticket) return { status: 'error', message: 'No existe el ticket' };

        this.tickets = this.tickets.map(ticket => {

            if (ticket.id === id) {
                ticket.done = true;
            }

            return ticket;

        });

        const ticketIndex = this.workingOnTickets.findIndex(ticket => ticket.id === id);
        this.workingOnTickets.splice(ticketIndex, 1);

        return { status: 'ok' };
    }

    private onTicketNumberChanged() {
        this.wsService.sendMessage('on-ticket-count-changed', this.pendindTickets.length);
    }

    private onWorkingOnChanged() {
        this.wsService.sendMessage('on-working-changed', this.lastWorkingOnTickets);
    }
}