import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  CreditCard,
  MapPin,
  Minus,
  Percent,
  Plus,
  Search,
  ShoppingBasket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { name: "Restaurant at This Street", cuisine: "Mughlai and Arabian", rating: "4.3", image: restaurantWarm },
  { name: "Restaurant behind that", cuisine: "North Indian and Chinese", rating: "3.8", image: restaurantBright },
  { name: "Restaurant next to that", cuisine: "Restrobar and Night Pub", rating: "3.1", image: restaurantWarm },
];

const dishes = [
  { name: "Mughlai Lasees Kebabs", detail: "Serves 4", price: "1199/-", image: indianSpread },
  { name: "Andhra Chicken Biryani", detail: "Family Pack", price: "1399/-", image: biryani },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-panel-line pb-1 text-[18px] font-bold leading-6">{children}</h2>;
}

function TopBar({ title, cart = false }: { title: string; cart?: boolean }) {
  return (
    <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-panel-line px-5">
      <ArrowLeft className="shrink-0 text-primary" size={25} strokeWidth={2.2} aria-hidden="true" />
      <h1 className="truncate text-center text-[16px] font-bold">{title}</h1>
      {cart ? <ShoppingBasket className="text-primary" size={26} fill="currentColor" aria-label="Basket" /> : <span />}
    </div>
  );
}

function Index() {
  const [category, setCategory] = useState("Rice and Biryani");
  const [restaurant, setRestaurant] = useState(restaurants[0]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(1);
  const [ordered, setOrdered] = useState(false);

  const filteredDishes = useMemo(
    () => dishes.filter((dish) => dish.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <main className="min-h-screen bg-cover bg-center p-4 lg:h-screen lg:min-h-[720px]" style={{ backgroundImage: `url(${restaurantWarm})` }}>
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1425px] overflow-hidden rounded-[28px] bg-panel shadow-app lg:h-[calc(100vh-2rem)] lg:grid-cols-[30%_23%_25%_22%]">
        <section className="food-pattern min-w-0 overflow-y-auto border-b border-border p-5 lg:border-r lg:border-b-0">
          <header className="flex items-center gap-2 border-b-2 border-panel-line pb-2">
            <MapPin className="text-primary" size={31} strokeWidth={2.8} />
            <h1 className="text-[21px] font-bold">Home - This Street, That Cross</h1>
          </header>
          <label className="mt-10 flex h-12 items-center gap-3 rounded-md border border-input bg-panel px-4 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="text-primary" size={26} />
            <input className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" placeholder="Restaurant, Cuisine or Dish" />
          </label>

          <div className="mt-6 grid grid-cols-[1.2fr_1fr] gap-4">
            <img src={indianSpread} alt="A spread of Indian dishes" width={1200} height={800} className="h-[155px] w-full rounded-md object-cover" />
            <div className="grid gap-3">
              <Button className="h-11 justify-start rounded-md px-3 text-[13px] uppercase"><Percent size={23} />Grab your coupons</Button>
              <Button className="h-11 justify-start rounded-md px-3 text-[13px] uppercase"><CreditCard size={23} />Instant order</Button>
              <Button className="h-11 justify-start rounded-md px-3 text-[13px] uppercase"><CalendarClock size={23} />Schedule an order</Button>
            </div>
          </div>

          <h2 className="mt-12 text-[17px] font-extrabold">What are you Craving for today?</h2>
          <div className="mt-6 grid grid-cols-3 gap-x-5 gap-y-7">
            {categories.map(([name, image], index) => (
              <button key={name} onClick={() => setCategory(name)} className="group text-center" aria-pressed={category === name}>
                <span className={`mx-auto block aspect-square w-full max-w-[98px] overflow-hidden rounded-full border-2 transition-all ${category === name ? "border-primary shadow-md" : "border-transparent group-hover:border-primary/60"}`}>
                  <img src={image} alt="" width={1200} height={800} loading={index > 2 ? "lazy" : undefined} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </span>
                <span className="mt-2 block text-[14px] leading-4">{name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="food-pattern min-w-0 overflow-y-auto border-b border-border px-5 py-6 lg:border-r lg:border-b-0">
          <h2 className="text-[14px] font-extrabold">Find by Restaurant</h2>
          <div className="mt-8 space-y-8">
            {restaurants.map((item, index) => (
              <button key={item.name} onClick={() => setRestaurant(item)} className={`block w-full overflow-hidden rounded-md border bg-panel text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${restaurant.name === item.name ? "border-primary" : "border-border"}`}>
                <img src={item.image} alt={`${item.name} interior`} width={1200} height={800} loading={index > 0 ? "lazy" : undefined} className="h-[150px] w-full object-cover" />
                <span className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
                  <span className="min-w-0">
                    <strong className="block truncate text-[13px]">{item.name}</strong>
                    <span className="block truncate text-[11px] text-muted-foreground">{item.cuisine}</span>
                  </span>
                  <span className="rounded-sm bg-success px-3 py-0.5 text-xs font-bold text-primary-foreground">{item.rating}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="food-pattern min-w-0 overflow-y-auto border-b border-border lg:border-r lg:border-b-0">
          <TopBar title={restaurant.name} cart />
          <div className="p-4">
            <SectionTitle>Menu</SectionTitle>
            <label className="mt-4 flex h-10 items-center gap-3 rounded-md border border-input bg-panel px-3">
              <Search className="text-primary" size={22} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" placeholder="What are you craving for?" />
            </label>
            <h2 className="mt-3 text-[18px] font-bold">Recommendations</h2>
            <article className="mt-2 overflow-hidden rounded-lg border border-border bg-panel shadow-sm">
              <img src={biryani} alt="Andhra Mutton Biryani" width={1200} height={800} className="h-[145px] w-full object-cover" />
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
                <div className="min-w-0 text-xs"><strong className="block truncate text-[13px]">Andhra Mutton Biryani</strong><span>Serves 2</span><span className="float-right mr-2">750/-</span></div>
                <div className="grid gap-1"><Button onClick={() => setCartCount((count) => count + 1)} className="h-6 rounded-sm px-4 text-xs">Add +</Button><Button variant="schedule" className="h-6 rounded-sm px-3 text-xs">Schedule</Button></div>
              </div>
            </article>
            <h2 className="mt-4 text-[18px] font-bold">More from the Menu</h2>
            <div className="mt-2 divide-y divide-border">
              {filteredDishes.length ? filteredDishes.map((dish) => (
                <article key={dish.name} className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3 py-4">
                  <div className="min-w-0"><h3 className="text-[14px] font-bold leading-4">{dish.name}</h3><p className="text-xs">{dish.detail}<br />{dish.price}</p><div className="mt-3 flex gap-6"><Button onClick={() => setCartCount((count) => count + 1)} className="h-7 rounded-sm px-5 text-xs">Add +</Button><Button variant="schedule" className="h-7 rounded-sm px-4 text-xs">Schedule</Button></div></div>
                  <img src={dish.image} alt={dish.name} width={1200} height={800} loading="lazy" className="h-24 w-[92px] rounded-md object-cover" />
                </article>
              )) : <p className="py-8 text-center text-sm text-muted-foreground">No dishes found.</p>}
            </div>
          </div>
        </section>

        <section className="food-pattern min-w-0 overflow-y-auto">
          <TopBar title="Schedule Order" />
          <div className="p-5">
            <SectionTitle>{restaurant.name}</SectionTitle>
            <div className="mt-5 grid grid-cols-[84px_minmax(0,1fr)] gap-4">
              <img src={indianSpread} alt="Mughlai Lasees Kebabs" width={1200} height={800} className="h-24 w-[84px] rounded-md object-cover" />
              <div className="min-w-0"><h3 className="text-[13px] font-bold leading-4">Mughlai Lasees Kebabs</h3><p className="text-xs">Serves 4<br />1199/-</p><div className="mt-3 inline-grid grid-cols-3 border border-primary text-xs"><Button variant="icon" onClick={() => setCartCount((count) => Math.max(1, count - 1))} className="h-6 w-7 rounded-none p-0" aria-label="Remove one"><Minus size={12} /></Button><span className="grid h-6 w-9 place-items-center bg-panel">{cartCount}</span><Button variant="icon" onClick={() => setCartCount((count) => count + 1)} className="h-6 w-7 rounded-none p-0" aria-label="Add one"><Plus size={12} /></Button></div></div>
            </div>
            <h2 className="mt-7 border-b border-panel-line pb-1 text-[15px] font-bold">Select the Time Slot</h2>
            <form onSubmit={(event) => { event.preventDefault(); setOrdered(true); }} className="mt-5 border border-panel-line bg-panel/90 p-5">
              {["Date", "Time", "Address"].map((label) => (
                <label key={label} className="mb-3 grid grid-cols-[62px_minmax(0,1fr)] items-center gap-2 text-[13px] font-bold">
                  {label}
                  <span className="relative">
                    <select className="h-7 w-full appearance-none rounded-sm border border-panel-line bg-panel px-3 pr-8 text-xs font-normal outline-none focus:ring-1 focus:ring-ring" defaultValue={label === "Date" ? "Today" : label === "Time" ? "9:30AM to 11:30AM" : "Home"}>
                      {label === "Date" && <><option>Today</option><option>Tomorrow</option></>}
                      {label === "Time" && <><option>9:30AM to 11:30AM</option><option>12:30PM to 2:30PM</option><option>6:30PM to 8:30PM</option></>}
                      {label === "Address" && <><option>Home</option><option>Office</option></>}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1.5 right-2" size={15} />
                  </span>
                </label>
              ))}
              <Button type="submit" variant="schedule" className="mt-2 h-9 w-full rounded-md text-sm">Schedule Order</Button>
              {ordered && <p role="status" className="mt-3 text-center text-xs font-bold text-success">Order scheduled successfully.</p>}
            </form>
            <div className="mt-8 text-right text-7xl font-extrabold text-primary" aria-hidden="true">Z</div>
          </div>
        </section>
      </div>
    </main>
  );
}
