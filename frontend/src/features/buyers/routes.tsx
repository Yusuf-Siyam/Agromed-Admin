import BuyerList from './components/BuyerList';
import BuyerDetails from './components/BuyerDetails';

export const BuyersRoutes = [
  {
    path: '/buyers',
    element: <BuyerList />
  },
  {
    path: '/buyers/:id',
    element: <BuyerDetails />
  }
];
