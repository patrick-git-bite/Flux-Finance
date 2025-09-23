import {
  Landmark,
  ShoppingCart,
  Home,
  Car,
  Ticket,
  HeartPulse,
  UtensilsCrossed,
  Shirt,
  Lightbulb,
  HelpCircle,
  LucideProps,
  LineChart,
} from 'lucide-react';
import { Category } from './data';

export const iconList = {
    Landmark,
    ShoppingCart,
    Home,
    Car,
    Ticket,
    HeartPulse,
    UtensilsCrossed,
    Shirt,
    Lightbulb,
    LineChart,
} as const;

type IconName = keyof typeof iconList;

export const getIconForCategory = (iconName?: string): React.ComponentType<LucideProps> => {
    if (iconName && iconName in iconList) {
        return iconList[iconName as IconName];
    }
    return HelpCircle;
}
