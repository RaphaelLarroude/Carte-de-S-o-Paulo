
import { 
  MapPin, Home, Building2, Building, Briefcase, GraduationCap, TrainFront, Bus, Car, Bike, 
  Plane, Ship, TramFront, Rocket, Tent, TreePine, Mountain, Waves, Sun, Moon, 
  Store, Warehouse, Factory, Church, School, University, Hospital, Hotel, Landmark, Castle, 
  Utensils, CupSoda, Coffee, Pizza, Cake, Apple, Beer, Wine, IceCream, ShoppingCart, 
  ShoppingBag, Trash2, Heart, Star, Flag, Bell, Info, Shield, Lock, Eye, 
  Compass, Navigation, Navigation2, Search, Crosshair, Target, Locate, LocateFixed, Pin, 
  TreePalm, Flower2, Cloud, Leaf, Sprout, Fuel, ParkingCircle, Terminal, DollarSign, 
  CreditCard, PiggyBank, Tag, Gift, Stethoscope, Microscope, Pill, Syringe, Thermometer, 
  Dna, FlaskConical, Laptop, Smartphone, Tablet, Monitor, Mail, Phone, Wifi, 
  Bluetooth, Camera, Mic, Headphones, Music, Film, Gamepad2, Trophy, Dumbbell, Library, 
  Book, Palette, Theater, Unlock, Key, Hammer, Wrench, PenTool, Lamp, 
  Anchor, Umbrella, GlassWater, Ghost, Skull, Coffee as CoffeeIcon
} from 'lucide-react';

export const ICON_CATEGORIES = [
  {
    id: 'essentials',
    name: 'Essentiels',
    icons: [
      { id: 'map-pin', Icon: MapPin },
      { id: 'home', Icon: Home },
      { id: 'building-2', Icon: Building2 },
      { id: 'building', Icon: Building },
      { id: 'work', Icon: Briefcase },
      { id: 'school', Icon: GraduationCap },
      { id: 'flag', Icon: Flag },
      { id: 'star', Icon: Star },
      { id: 'heart', Icon: Heart },
      { id: 'bell', Icon: Bell },
      { id: 'info', Icon: Info },
      { id: 'pin', Icon: Pin },
      { id: 'search', Icon: Search },
      { id: 'trash-2', Icon: Trash2 }
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icons: [
      { id: 'compass', Icon: Compass },
      { id: 'navigation', Icon: Navigation },
      { id: 'navigation-2', Icon: Navigation2 },
      { id: 'crosshair', Icon: Crosshair },
      { id: 'target', Icon: Target },
      { id: 'locate', Icon: Locate },
      { id: 'locate-fixed', Icon: LocateFixed },
      { id: 'anchor', Icon: Anchor }
    ]
  },
  {
    id: 'places',
    name: 'Lieux',
    icons: [
      { id: 'store', Icon: Store },
      { id: 'warehouse', Icon: Warehouse },
      { id: 'factory', Icon: Factory },
      { id: 'church', Icon: Church },
      { id: 'university', Icon: University },
      { id: 'hospital', Icon: Hospital },
      { id: 'hotel', Icon: Hotel },
      { id: 'landmark', Icon: Landmark },
      { id: 'castle', Icon: Castle },
      { id: 'theater', Icon: Theater },
      { id: 'library', Icon: Library },
      { id: 'park', Icon: TreePine },
      { id: 'tent', Icon: Tent },
      { id: 'mountain', Icon: Mountain }
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    icons: [
      { id: 'car', Icon: Car },
      { id: 'bus', Icon: Bus },
      { id: 'train', Icon: TrainFront },
      { id: 'tram', Icon: TramFront },
      { id: 'bike', Icon: Bike },
      { id: 'plane', Icon: Plane },
      { id: 'ship', Icon: Ship },
      { id: 'rocket', Icon: Rocket },
      { id: 'parking', Icon: ParkingCircle },
      { id: 'fuel', Icon: Fuel }
    ]
  },
  {
    id: 'food',
    name: 'Alimentation',
    icons: [
      { id: 'utensils', Icon: Utensils },
      { id: 'coffee', Icon: Coffee },
      { id: 'pizza', Icon: Pizza },
      { id: 'cake', Icon: Cake },
      { id: 'cup-soda', Icon: CupSoda },
      { id: 'apple', Icon: Apple },
      { id: 'beer', Icon: Beer },
      { id: 'wine', Icon: Wine },
      { id: 'ice-cream', Icon: IceCream },
      { id: 'glass-water', Icon: GlassWater }
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icons: [
      { id: 'shopping-cart', Icon: ShoppingCart },
      { id: 'shopping-bag', Icon: ShoppingBag },
      { id: 'tag', Icon: Tag },
      { id: 'gift', Icon: Gift },
      { id: 'credit-card', Icon: CreditCard },
      { id: 'dollar-sign', Icon: DollarSign },
      { id: 'piggy-bank', Icon: PiggyBank }
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    icons: [
      { id: 'tree-palm', Icon: TreePalm },
      { id: 'flower-2', Icon: Flower2 },
      { id: 'waves', Icon: Waves },
      { id: 'sun', Icon: Sun },
      { id: 'moon', Icon: Moon },
      { id: 'cloud', Icon: Cloud },
      { id: 'leaf', Icon: Leaf },
      { id: 'sprout', Icon: Sprout },
      { id: 'umbrella', Icon: Umbrella }
    ]
  },
  {
    id: 'health',
    name: 'Santé',
    icons: [
      { id: 'stethoscope', Icon: Stethoscope },
      { id: 'microscope', Icon: Microscope },
      { id: 'pill', Icon: Pill },
      { id: 'syringe', Icon: Syringe },
      { id: 'thermometer', Icon: Thermometer },
      { id: 'dna', Icon: Dna },
      { id: 'flask', Icon: FlaskConical }
    ]
  },
  {
    id: 'tech',
    name: 'Technologie',
    icons: [
      { id: 'laptop', Icon: Laptop },
      { id: 'smartphone', Icon: Smartphone },
      { id: 'tablet', Icon: Tablet },
      { id: 'monitor', Icon: Monitor },
      { id: 'mail', Icon: Mail },
      { id: 'phone', Icon: Phone },
      { id: 'wifi', Icon: Wifi },
      { id: 'bluetooth', Icon: Bluetooth },
      { id: 'camera', Icon: Camera },
      { id: 'mic', Icon: Mic },
      { id: 'headphones', Icon: Headphones }
    ]
  },
  {
    id: 'entertainment',
    name: 'Loisirs & Art',
    icons: [
      { id: 'music', Icon: Music },
      { id: 'film', Icon: Film },
      { id: 'gamepad', Icon: Gamepad2 },
      { id: 'trophy', Icon: Trophy },
      { id: 'dumbbell', Icon: Dumbbell },
      { id: 'book', Icon: Book },
      { id: 'palette', Icon: Palette }
    ]
  },
  {
    id: 'tools',
    name: 'Outils',
    icons: [
      { id: 'wrench', Icon: Wrench },
      { id: 'pen-tool', Icon: PenTool },
      { id: 'lamp', Icon: Lamp },
      { id: 'key', Icon: Key },
      { id: 'unlock', Icon: Unlock },
      { id: 'lock', Icon: Lock },
      { id: 'shield', Icon: Shield },
      { id: 'eye', Icon: Eye }
    ]
  },
  {
    id: 'other',
    name: 'Autres',
    icons: [
      { id: 'ghost', Icon: Ghost },
      { id: 'skull', Icon: Skull }
    ]
  }
];

export const ALL_ICONS = ICON_CATEGORIES.flatMap(cat => cat.icons);
export const SYMBOL_LIST = ALL_ICONS;
