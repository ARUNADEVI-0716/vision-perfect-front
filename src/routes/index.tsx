import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  CalendarClock,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  MapPin,
  Minus,
  Percent,
  Plus,
  Search,
  ShoppingBasket,
  Tag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import biryani from "@/assets/biryani.jpg";
import indianSpread from "@/assets/indian-spread.jpg";
import restaurantBright from "@/assets/restaurant-bright.jpg";
import restaurantWarm from "@/assets/restaurant-warm.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Order Food | This Street, That Cross" },
      { name: "description", content: "Browse nearby restaurants, add dishes, and schedule a convenient delivery." },
      { property: "og:title", content: "Order Food | This Street, That Cross" },
      { property: "og:description", content: "Browse nearby restaurants, add dishes, and schedule a convenient delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  ["Rice and Biryani", biryani],
  ["Healthy", indianSpread],
  ["Paneer", indianSpread],
  ["Pizzaaaaaa", restaurantBright],
  ["Desserts", indianSpread],
  ["Fast Food", restaurantWarm],
] as const;

const restaurants = [
  { id: "this-street", name: "Restaurant at This Street", cuisine: "Mughlai and Arabian", rating: "4.3", image: restaurantWarm },
  { id: "behind", name: "Restaurant behind that", cuisine: "North Indian and Chinese", rating: "3.8", image: restaurantBright },
  { id: "next", name: "Restaurant next to that", cuisine: "Restrobar and Night Pub", rating: "3.1", image: restaurantWarm },
] as const;

type Restaurant = (typeof restaurants)[number];

const initialRestaurant = restaurants[0] ?? {
  id: "this-street",
  name: "Restaurant at This Street",
  cuisine: "Mughlai and Arabian",
  rating: "4.3",
  image: restaurantWarm,
};

type Dish = {
  id: string;
  name: string;
  detail: string;
  price: number;
  category: string;
  image: string;
  restaurantIds: readonly string[];
  featured?: boolean;
};

const dishes: Dish[] = [
  { id: "mutton-biryani", name: "Andhra Mutton Biryani", detail: "Serves 2", price: 750, category: "Rice and Biryani", image: biryani, restaurantIds: ["this-street", "behind"], featured: true },
  { id: "kebabs", name: "Mughlai Lasees Kebabs", detail: "Serves 4", price: 1199, category: "Healthy", image: indianSpread, restaurantIds: ["this-street", "next"] },
  { id: "chicken-biryani", name: "Andhra Chicken Biryani", detail: "Family Pack", price: 1399, category: "Rice and Biryani", image: biryani, restaurantIds: ["this-street", "behind"] },
  { id: "paneer", name: "Royal Paneer Platter", detail: "Serves 2", price: 649, category: "Paneer", image: indianSpread, restaurantIds: ["behind", "this-street"] },
  { id: "pizza", name: "Garden Tandoori Pizza", detail: "Large", price: 599, category: "Pizzaaaaaa", image: restaurantBright, restaurantIds: ["next"] },
  { id: "dessert", name: "Saffron Dessert Box", detail: "6 pieces", price: 399, category: "Desserts", image: indianSpread, restaurantIds: ["this-street", "next"] },
  { id: "burger", name: "Spiced Street Burger", detail: "Serves 1", price: 349, category: "Fast Food", image: restaurantWarm, restaurantIds: ["next", "behind"] },
];

const couponOptions = [
  { code: "STREET20", label: "20% off", description: "Save up to ₹300", rate: 0.2, cap: 300 },
  { code: "QUICK100", label: "₹100 off", description: "On orders over ₹799", flat: 100, minimum: 799 },
] as const;

const scheduleSchema = z.object({
  date: z.date({ required_error: "Choose a delivery date." }),
  time: z.string().trim().min(1, "Choose a time slot."),
  address: z.string().trim().min(1, "Choose a delivery address."),
});

type Cart = Record<string, number>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-panel-line pb-1 text-[18px] font-bold leading-6">{children}</h2>;
}

function TopBar({ title, cartCount, onCart }: { title: string; cartCount?: number; onCart?: () => void }) {
  return (
    <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-panel-line px-5">
      <ArrowLeft className="shrink-0 text-primary" size={25} strokeWidth={2.2} aria-hidden="true" />
      <h1 className="truncate text-center text-[16px] font-bold">{title}</h1>
      {onCart ? (
        <Button variant="ghost" size="icon" onClick={onCart} className="relative size-9 rounded-full" aria-label={`Open basket with ${cartCount ?? 0} items`}>
          <ShoppingBasket className="text-primary" size={26} fill="currentColor" />
          {(cartCount ?? 0) > 0 && <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{cartCount}</span>}
        </Button>
      ) : <span />}
    </div>
  );
}

function Index() {
  const scheduleRef = useRef<HTMLElement>(null);
  const [category, setCategory] = useState<string>("Rice and Biryani");
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);
  const [globalSearch, setGlobalSearch] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [cart, setCart] = useState<Cart>({ kebabs: 1 });
  const [coupon, setCoupon] = useState<(typeof couponOptions)[number] | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState<"instant" | "scheduled">("instant");
  const [scheduleDishId, setScheduleDishId] = useState("kebabs");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("9:30AM to 11:30AM");
  const [address, setAddress] = useState("Home");
  const [scheduleError, setScheduleError] = useState("");
  const [ordered, setOrdered] = useState(false);

  const filteredRestaurants = useMemo(() => {
    const query = globalSearch.trim().toLowerCase().slice(0, 80);
    if (!query) return restaurants;
    return restaurants.filter((item) => `${item.name} ${item.cuisine}`.toLowerCase().includes(query));
  }, [globalSearch]);

  const availableDishes = useMemo(() => {
    const query = `${globalSearch} ${menuSearch}`.trim().toLowerCase().slice(0, 120);
    return dishes.filter((dish) => {
      const belongsToRestaurant = dish.restaurantIds.includes(restaurant.id);
      const matchesCategory = dish.category === category;
      const matchesSearch = !query || `${dish.name} ${dish.detail} ${dish.category}`.toLowerCase().includes(query);
      return belongsToRestaurant && (matchesCategory || Boolean(query)) && matchesSearch;
    });
  }, [category, globalSearch, menuSearch, restaurant.id]);

  const featuredDish = dishes.find((dish) => dish.featured && dish.restaurantIds.includes(restaurant.id)) ?? dishes[0];
  const scheduledDish = dishes.find((dish) => dish.id === scheduleDishId) ?? featuredDish;
  const cartLines = dishes.flatMap((dish) => {
    const quantity = cart[dish.id] ?? 0;
    return quantity > 0 ? [{ dish, quantity }] : [];
  });
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.dish.price * line.quantity, 0);
  const couponDiscount = coupon
    ? "rate" in coupon
      ? Math.min(subtotal * coupon.rate, coupon.cap)
      : subtotal >= coupon.minimum ? coupon.flat : 0
    : 0;
  const deliveryFee = subtotal > 0 && subtotal < 999 ? 49 : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      if (next === 0) {
        const { [id]: removed, ...rest } = current;
        void removed;
        return rest;
      }
      return { ...current, [id]: next };
    });
  };

  const addDish = (dish: Dish) => changeQuantity(dish.id, 1);
  const openSchedule = (dish: Dish) => {
    setScheduleDishId(dish.id);
    setOrdered(false);
    scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    const result = scheduleSchema.safeParse({ date, time, address });
    if (!result.success) {
      setScheduleError(result.error.issues[0]?.message ?? "Complete all schedule details.");
      return;
    }
    setScheduleError("");
    if (scheduledDish) addDish(scheduledDish);
    setOrdered(true);
    setConfirmationMode("scheduled");
    setConfirmationOpen(true);
  };

  const placeInstantOrder = () => {
    if (cartCount === 0 && featuredDish) addDish(featuredDish);
    setConfirmationMode("instant");
    setCartOpen(false);
    setConfirmationOpen(true);
  };

  return (
    <main className="restaurant-backdrop min-h-screen p-4 lg:h-screen lg:min-h-[720px]">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1425px] overflow-hidden rounded-[28px] bg-panel shadow-app lg:h-[calc(100vh-2rem)] lg:grid-cols-[30%_23%_25%_22%]">
        <section className="food-pattern min-w-0 overflow-y-auto border-b border-border p-5 lg:border-r lg:border-b-0">
          <header className="flex items-center gap-2 border-b-2 border-panel-line pb-2">
            <MapPin className="text-primary" size={31} strokeWidth={2.8} />
            <h1 className="text-[21px] font-bold">Home - This Street, That Cross</h1>
          </header>
          <label className="mt-10 flex h-12 items-center gap-3 rounded-md border border-input bg-panel px-4 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="text-primary" size={26} />
            <input value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value.slice(0, 80))} maxLength={80} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" placeholder="Restaurant, Cuisine or Dish" />
          </label>

          <div className="mt-6 grid grid-cols-[1.2fr_1fr] gap-4">
            <img src={indianSpread} alt="A spread of Indian dishes" width={1200} height={800} className="h-[155px] w-full rounded-md object-cover" />
            <div className="grid gap-3">
              <Button onClick={() => setCouponOpen(true)} className="h-11 justify-start rounded-md px-3 text-[13px] uppercase"><Percent size={23} />Grab your coupons</Button>
              <Button onClick={() => setCartOpen(true)} className="h-11 justify-start rounded-md px-3 text-[13px] uppercase"><CreditCard size={23} />Instant order</Button>
              <Button onClick={() => scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="h-11 justify-start rounded-md px-3 text-[13px] uppercase"><CalendarClock size={23} />Schedule an order</Button>
            </div>
          </div>

          <h2 className="mt-12 text-[17px] font-extrabold">What are you Craving for today?</h2>
          <div className="mt-6 grid grid-cols-3 gap-x-5 gap-y-7">
            {categories.map(([name, image], index) => (
              <Button key={name} variant="ghost" onClick={() => { setCategory(name); setMenuSearch(""); }} className="group h-auto flex-col gap-0 rounded-md p-1 text-center whitespace-normal" aria-pressed={category === name}>
                <span className={`mx-auto block aspect-square w-full max-w-[98px] overflow-hidden rounded-full border-2 transition-all ${category === name ? "border-primary shadow-md" : "border-transparent group-hover:border-primary/60"}`}>
                  <img src={image} alt="" width={1200} height={800} loading={index > 2 ? "lazy" : undefined} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </span>
                <span className="mt-2 block text-[14px] leading-4">{name}</span>
              </Button>
            ))}
          </div>
        </section>

        <section className="food-pattern min-w-0 overflow-y-auto border-b border-border px-5 py-6 lg:border-r lg:border-b-0">
          <h2 className="text-[14px] font-extrabold">Find by Restaurant</h2>
          <div className="mt-8 space-y-8">
            {filteredRestaurants.length ? filteredRestaurants.map((item, index) => (
              <Button key={item.id} variant="ghost" onClick={() => setRestaurant(item)} className={`block h-auto w-full overflow-hidden rounded-md border bg-panel p-0 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-panel hover:shadow-md ${restaurant.id === item.id ? "border-primary" : "border-border"}`}>
                <img src={item.image} alt={`${item.name} interior`} width={1200} height={800} loading={index > 0 ? "lazy" : undefined} className="h-[150px] w-full object-cover" />
                <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
                  <span className="min-w-0"><strong className="block truncate text-[13px]">{item.name}</strong><span className="block truncate text-[11px] font-normal text-muted-foreground">{item.cuisine}</span></span>
                  <span className="rounded-sm bg-success px-3 py-0.5 text-xs font-bold text-primary-foreground">{item.rating}</span>
                </span>
              </Button>
            )) : <p className="py-10 text-center text-sm text-muted-foreground">No restaurants found.</p>}
          </div>
        </section>

        <section className="food-pattern min-w-0 overflow-y-auto border-b border-border lg:border-r lg:border-b-0">
          <TopBar title={restaurant.name} cartCount={cartCount} onCart={() => setCartOpen(true)} />
          <div className="p-4">
            <SectionTitle>Menu</SectionTitle>
            <label className="mt-4 flex h-10 items-center gap-3 rounded-md border border-input bg-panel px-3 focus-within:ring-1 focus-within:ring-ring">
              <Search className="text-primary" size={22} />
              <input value={menuSearch} onChange={(event) => setMenuSearch(event.target.value.slice(0, 80))} maxLength={80} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" placeholder="What are you craving for?" />
            </label>
            {featuredDish && (
              <>
                <h2 className="mt-3 text-[18px] font-bold">Recommendations</h2>
                <article className="mt-2 overflow-hidden rounded-lg border border-border bg-panel shadow-sm">
                  <img src={featuredDish.image} alt={featuredDish.name} width={1200} height={800} className="h-[145px] w-full object-cover" />
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
                    <div className="min-w-0 text-xs"><strong className="block truncate text-[13px]">{featuredDish.name}</strong><span>{featuredDish.detail}</span><span className="float-right mr-2">₹{featuredDish.price}</span></div>
                    <div className="grid gap-1"><Button onClick={() => addDish(featuredDish)} className="h-6 rounded-sm px-4 text-xs">Add +</Button><Button onClick={() => openSchedule(featuredDish)} variant="schedule" className="h-6 rounded-sm px-3 text-xs">Schedule</Button></div>
                  </div>
                </article>
              </>
            )}
            <h2 className="mt-4 text-[18px] font-bold">More from the Menu</h2>
            <div className="mt-2 divide-y divide-border">
              {availableDishes.length ? availableDishes.map((dish) => (
                <article key={dish.id} className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 py-4">
                  <div className="min-w-0"><h3 className="text-[14px] font-bold leading-4">{dish.name}</h3><p className="text-xs">{dish.detail}<br />₹{dish.price}</p><div className="mt-3 flex gap-6"><Button onClick={() => addDish(dish)} className="h-7 rounded-sm px-5 text-xs">Add +</Button><Button onClick={() => openSchedule(dish)} variant="schedule" className="h-7 rounded-sm px-4 text-xs">Schedule</Button></div></div>
                  <img src={dish.image} alt={dish.name} width={1200} height={800} loading="lazy" className="h-24 w-[92px] rounded-md object-cover" />
                </article>
              )) : <p className="py-8 text-center text-sm text-muted-foreground">No dishes match this filter.</p>}
            </div>
          </div>
        </section>

        <section ref={scheduleRef} className="food-pattern min-w-0 scroll-mt-4 overflow-y-auto">
          <TopBar title="Schedule Order" />
          <div className="p-5">
            <SectionTitle>{restaurant.name}</SectionTitle>
            {scheduledDish && <div className="mt-5 grid grid-cols-[84px_minmax(0,1fr)] gap-4">
              <img src={scheduledDish.image} alt={scheduledDish.name} width={1200} height={800} className="h-24 w-[84px] rounded-md object-cover" />
              <div className="min-w-0"><h3 className="text-[13px] font-bold leading-4">{scheduledDish.name}</h3><p className="text-xs">{scheduledDish.detail}<br />₹{scheduledDish.price}</p><div className="mt-3 inline-grid grid-cols-3 border border-primary text-xs"><Button variant="icon" onClick={() => changeQuantity(scheduledDish.id, -1)} className="h-6 w-7 rounded-none p-0" aria-label="Remove one"><Minus size={12} /></Button><span className="grid h-6 w-9 place-items-center bg-panel">{cart[scheduledDish.id] ?? 0}</span><Button variant="icon" onClick={() => changeQuantity(scheduledDish.id, 1)} className="h-6 w-7 rounded-none p-0" aria-label="Add one"><Plus size={12} /></Button></div></div>
            </div>}
            <h2 className="mt-7 border-b border-panel-line pb-1 text-[15px] font-bold">Select the Time Slot</h2>
            <form onSubmit={submitSchedule} className="mt-5 border border-panel-line bg-panel/90 p-5">
              <div className="mb-3 grid grid-cols-[62px_minmax(0,1fr)] items-center gap-2 text-[13px] font-bold">
                Date
                <Popover>
                  <PopoverTrigger asChild><Button type="button" variant="outline" className="h-8 min-w-0 justify-start overflow-hidden px-2 text-left text-xs font-normal"><CalendarIcon size={14} /> <span className="truncate">{date ? format(date, "MMM d, yyyy") : "Pick date"}</span></Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end"><Calendar mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} className="pointer-events-auto p-3" /></PopoverContent>
                </Popover>
              </div>
              <label className="mb-3 grid grid-cols-[62px_minmax(0,1fr)] items-center gap-2 text-[13px] font-bold">Time<span className="relative"><select value={time} onChange={(event) => setTime(event.target.value)} className="h-8 w-full appearance-none rounded-sm border border-panel-line bg-panel px-2 pr-7 text-xs font-normal outline-none focus:ring-1 focus:ring-ring"><option value="">Choose time</option><option>9:30AM to 11:30AM</option><option>12:30PM to 2:30PM</option><option>6:30PM to 8:30PM</option></select><ChevronDown className="pointer-events-none absolute top-2 right-2" size={14} /></span></label>
              <label className="mb-3 grid grid-cols-[62px_minmax(0,1fr)] items-center gap-2 text-[13px] font-bold">Address<span className="relative"><select value={address} onChange={(event) => setAddress(event.target.value)} className="h-8 w-full appearance-none rounded-sm border border-panel-line bg-panel px-2 pr-7 text-xs font-normal outline-none focus:ring-1 focus:ring-ring"><option value="">Choose address</option><option>Home</option><option>Office</option></select><ChevronDown className="pointer-events-none absolute top-2 right-2" size={14} /></span></label>
              {scheduleError && <p role="alert" className="mb-2 text-xs font-semibold text-destructive">{scheduleError}</p>}
              <Button type="submit" variant="schedule" className="mt-2 h-9 w-full rounded-md text-sm">Schedule Order</Button>
              {ordered && <div className="mt-3 rounded-md border border-success bg-panel p-3 text-xs"><p className="flex items-center gap-2 font-bold text-success"><CheckCircle2 size={16} />Scheduled for {date ? format(date, "MMM d") : "selected date"}</p><Button type="button" variant="ghost" onClick={() => setOrdered(false)} className="mt-1 h-7 px-2 text-xs">Edit schedule</Button></div>}
            </form>
            <div className="mt-8 text-right text-7xl font-extrabold text-primary" aria-hidden="true">Z</div>
          </div>
        </section>
      </div>

      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="max-w-md bg-panel"><DialogHeader><DialogTitle>Available coupons</DialogTitle><DialogDescription>Choose one discount for this order.</DialogDescription></DialogHeader><div className="grid gap-3">{couponOptions.map((option) => <Button key={option.code} variant="outline" onClick={() => { setCoupon(option); setCouponOpen(false); }} className={`h-auto justify-between p-4 text-left ${coupon?.code === option.code ? "border-primary" : ""}`}><span><span className="flex items-center gap-2 font-bold"><Tag size={16} />{option.code}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{option.description}</span></span><span className="text-primary">{option.label}</span></Button>)}</div>{coupon && <Button variant="ghost" onClick={() => setCoupon(null)}>Remove coupon</Button>}</DialogContent>
      </Dialog>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto bg-panel"><DialogHeader><DialogTitle>Your order</DialogTitle><DialogDescription>{restaurant.name}</DialogDescription></DialogHeader>{cartLines.length ? <><div className="divide-y divide-border">{cartLines.map(({ dish, quantity }) => <div key={dish.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{dish.name}</p><p className="text-xs text-muted-foreground">₹{dish.price} each</p></div><div className="flex items-center gap-1"><Button variant="outline" size="icon" onClick={() => changeQuantity(dish.id, -1)} className="size-8"><Minus size={13} /></Button><span className="w-6 text-center text-sm">{quantity}</span><Button size="icon" onClick={() => changeQuantity(dish.id, 1)} className="size-8"><Plus size={13} /></Button><Button variant="ghost" size="icon" onClick={() => setCart((current) => { const { [dish.id]: removed, ...rest } = current; void removed; return rest; })} className="size-8 text-destructive" aria-label={`Remove ${dish.name}`}><Trash2 size={14} /></Button></div></div>)}</div><div className="space-y-1 border-t border-border pt-3 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></p>{couponDiscount > 0 && <p className="flex justify-between text-success"><span>{coupon?.code}</span><span>−₹{couponDiscount.toFixed(0)}</span></p>}<p className="flex justify-between"><span>Delivery</span><span>{deliveryFee ? `₹${deliveryFee}` : "Free"}</span></p><p className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>₹{total.toFixed(0)}</span></p></div><DialogFooter className="gap-2"><Button variant="outline" onClick={() => setCouponOpen(true)}>Coupon</Button><Button onClick={placeInstantOrder}>Place instant order</Button></DialogFooter></> : <div className="py-8 text-center"><ShoppingBasket className="mx-auto text-muted-foreground" size={36} /><p className="mt-3 text-sm text-muted-foreground">Your basket is empty.</p></div>}</DialogContent>
      </Dialog>

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="max-w-sm bg-panel text-center"><CheckCircle2 className="mx-auto text-success" size={48} /><DialogHeader className="text-center"><DialogTitle>{confirmationMode === "scheduled" ? "Order scheduled" : "Order confirmed"}</DialogTitle><DialogDescription>{confirmationMode === "scheduled" ? `${date ? format(date, "MMMM d, yyyy") : "Selected date"}, ${time} to ${address}` : `Your ₹${total.toFixed(0)} order is being prepared.`}</DialogDescription></DialogHeader><Button onClick={() => setConfirmationOpen(false)} className="w-full">Done</Button></DialogContent>
      </Dialog>
    </main>
  );
}
