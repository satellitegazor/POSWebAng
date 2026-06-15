import { EventConfig } from "../../models/event.config";

export interface ROVEventConfigState {
    eventConfig: EventConfig | null;
}

export const initialROVEventConfigState: ROVEventConfigState = {
    eventConfig: new EventConfig()
}

