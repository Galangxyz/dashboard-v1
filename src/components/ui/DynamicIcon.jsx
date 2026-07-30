import {
  Sunrise,
  Leaf,
  Crown,
  Wallet,
  ShieldCheck,
  Truck,
  MousePointerClick,
  MessageCircle,
  CheckCircle2,
  ChefHat,
  HeartHandshake,
  Star,
  HelpCircle,
} from "lucide-react";

const map = {
  Sunrise,
  Leaf,
  Crown,
  Wallet,
  ShieldCheck,
  Truck,
  MousePointerClick,
  MessageCircle,
  CheckCircle2,
  ChefHat,
  HeartHandshake,
  Star,
  HelpCircle,
};

export default function DynamicIcon({ name, className, ...props }) {
  const Icon = map[name] || HelpCircle;
  return <Icon className={className} {...props} />;
}