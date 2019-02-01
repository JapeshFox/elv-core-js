import { combineReducers } from "redux";

import NotificationsReducer from "./NotificationsReducer";
import AccountsReducer from "./AccountsReducer";
import RequestsReducer from "./RequestsReducer";
import ClientReducer from "./ClientReducer";
import RoutingReducer from "./RoutingReducer";

export default combineReducers({
  accounts: AccountsReducer,
  client: ClientReducer,
  notifications: NotificationsReducer,
  requests: RequestsReducer,
  routing: RoutingReducer
});
