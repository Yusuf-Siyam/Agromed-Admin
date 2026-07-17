import OrderList from './components/OrderList';
import OrderDetails from './components/OrderDetails';

export const OrdersRoutes = [
  {
    path: '/orders',
    element: <OrderList />
  },
  {
    path: '/orders/:id',
    element: <OrderDetails />
  }
];
