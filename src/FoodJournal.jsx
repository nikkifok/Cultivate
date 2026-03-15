import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "cultivate-journal";

const EMOJI_MAP = {
  breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍃", fast_break: "⏰", other: "✦"
};

function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeInitialDay() {
  return {
    id: Date.now(),
    date: getLocalDateString(),
    meals: [],
  };
}

function totalCals(meals) {
  return meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + (Number(i.calories) || 0), 0), 0);
}

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" });
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function FoodJournal() {
  const [days, setDays] = useState([]);
  const [activeDayId, setActiveDayId] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddItem, setShowAddItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // { mealId, itemId }
  const [editValues, setEditValues] = useState({ name: "", amount: "", calories: "" });
  const [newMeal, setNewMeal] = useState({ type: "other", time: "", note: "" });
  const [newItem, setNewItem] = useState({ name: "", amount: "", calories: "" });

  const [loaded, setLoaded] = useState(false);
  const [goalCals, setGoalCals] = useState(1800);
  const [editingGoal, setEditingGoal] = useState(false);
  const goalRef = useRef();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && stored.days?.length) {
      setDays(stored.days);
      setGoalCals(stored.goalCals || 1800);
      setActiveDayId(stored.days[0].id);
    } else {
      const today = makeInitialDay();
      setDays([today]);
      setActiveDayId(today.id);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!loaded) return;
    saveToStorage({ days, goalCals });
  }, [days, goalCals, loaded]);

  const activeDay = days.find((d) => d.id === activeDayId);

  function addNewDay() {
    const today = getLocalDateString(); 
    const exists = days.find((d) => d.date === today);
    if (exists) { setActiveDayId(exists.id); return; }
    const nd = makeInitialDay();
    setDays([nd, ...days]);
    setActiveDayId(nd.id);
  }

  function addMeal() {
    if (!newMeal.time) return;
    const meal = { id: Date.now(), ...newMeal, items: [] };
    setDays(days.map((d) => d.id === activeDayId ? { ...d, meals: [...d.meals, meal] } : d));
    setNewMeal({ type: "other", time: "", note: "" });
    setShowAddMeal(false);
  }

  function addItem(mealId) {
    if (!newItem.name) return;
    setDays(days.map((d) =>
      d.id === activeDayId
        ? { ...d, meals: d.meals.map((m) => m.id === mealId ? { ...m, items: [...m.items, { ...newItem, id: Date.now() }] } : m) }
        : d
    ));
    setNewItem({ name: "", amount: "", calories: "" });
    setShowAddItem(null);
  }

  function deleteMeal(mealId) {
    setDays(days.map((d) => d.id === activeDayId ? { ...d, meals: d.meals.filter((m) => m.id !== mealId) } : d));
  }

  function updateItem(mealId, itemId) {
  setDays(days.map((d) =>
    d.id === activeDayId
      ? { ...d, meals: d.meals.map((m) =>
          m.id === mealId
            ? { ...m, items: m.items.map((i) => i.id === itemId ? { ...i, ...editValues } : i) }
            : m
        )}
      : d
  ));
  setEditingItem(null);
  }

  function deleteItem(mealId, itemId) {
    setDays(days.map((d) =>
      d.id === activeDayId
        ? { ...d, meals: d.meals.map((m) => m.id === mealId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m) }
        : d
    ));
  }

  const dayCals = activeDay ? totalCals(activeDay.meals) : 0;
  const pct = Math.min(100, Math.round((dayCals / goalCals) * 100));
  const ringColor = pct < 60 ? "#57FFD4" : pct < 90 ? "#C8FF57" : "#FF5C8A";

  if (!loaded) return (
    <div style={{ background: "#0A2A2A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#7ABFB8", fontFamily: "Georgia, serif", letterSpacing: "0.15em" }}>loading journal…</p>
    </div>
  );

  return (
    <div style={{
      background: "#0A2A2A",
      minHeight: "100vh",
      fontFamily: "'Georgia', serif",
      color: "#E8F8F5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 0 80px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A2A2A; }
        ::-webkit-scrollbar-thumb { background: #164444; border-radius: 2px; }
        .day-pill { cursor: pointer; padding: 6px 14px; border-radius: 20px; border: 1px solid #164444; background: transparent; color: #7ABFB8; font-family: 'DM Sans', sans-serif; font-size: 12px; transition: all 0.2s; white-space: nowrap; }
        .day-pill:hover { border-color: #7ABFB8; color: #E8F8F5; }
        .day-pill.active { background: #164444; border-color: #7ABFB8; color: #E8F8F5; }
        .ghost-btn { background: none; border: 1px dashed #164444; color: #7ABFB8; cursor: pointer; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 6px 14px; transition: all 0.2s; }
        .ghost-btn:hover { border-color: #7ABFB8; color: #E8F8F5; }
        .del-btn { background: none; border: none; color: #164444; cursor: pointer; font-size: 14px; padding: 2px 6px; border-radius: 4px; transition: all 0.2s; }
        .del-btn:hover { color: #FF5C8A; background: #0F3535; }
        .input-field { background: #0F3535; border: 1px solid #164444; color: #E8F8F5; border-radius: 6px; padding: 8px 12px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border 0.2s; }
        .input-field:focus { border-color: #57FFD4; }
        .input-field::placeholder { color: #164444; }
        select.input-field option { background: #0F3535; }
        .action-btn { background: #164444; border: none; color: #E8F8F5; cursor: pointer; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 18px; transition: all 0.2s; }
        .action-btn:hover { background: #1E5555; }
        .cancel-btn { background: none; border: 1px solid #164444; color: #7ABFB8; cursor: pointer; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 18px; transition: all 0.2s; }
        .cancel-btn:hover { color: #E8F8F5; border-color: #7ABFB8; }
        .meal-card { background: #0F3535; border: 1px solid #164444; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; transition: border-color 0.2s; }
        .meal-card:hover { border-color: #7ABFB8; }
        .item-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid #164444; }
        .item-row:last-child { border-bottom: none; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        .ring-track { fill: none; stroke: #164444; stroke-width: 6; }
        .ring-fill { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.8s ease, stroke 0.4s ease; }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 560, padding: "32px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400, margin: 0, letterSpacing: "0.02em" }}>
              Cultiv<span style={{ fontWeight: 700, color: "#C8FF57" }}>ATE</span>
            </h1>
            <p style={{ color: "#7ABFB8", fontFamily: "'DM Sans', sans-serif", fontSize: 12, margin: "4px 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              food journal
            </p>
          </div>

          {/* Calorie ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle className="ring-track" cx="32" cy="32" r="26" />
              <circle
                className="ring-fill"
                cx="32" cy="32" r="26"
                stroke={ringColor}
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="35" textAnchor="middle" fill="#e8dcc8" fontSize="11" fontFamily="'DM Sans', sans-serif" fontWeight="500">{pct}%</text>
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 500, color: "#e8dcc8", lineHeight: 1 }}>
                {dayCals}
              </div>
              <div
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#7ABFB8", cursor: "pointer", marginTop: 2 }}
                onClick={() => setEditingGoal(true)}
                title="Click to edit goal"
              >
                / {goalCals} kcal
              </div>
            </div>
          </div>
        </div>

        {editingGoal && (
          <div className="fade-in" style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <input
              ref={goalRef}
              className="input-field"
              type="number"
              defaultValue={goalCals}
              style={{ width: 100 }}
              placeholder="goal kcal"
            />
            <button className="action-btn" style={{ padding: "8px 12px" }} onClick={() => {
              const v = parseInt(goalRef.current.value);
              if (v > 0) setGoalCals(v);
              setEditingGoal(false);
            }}>set</button>
            <button className="cancel-btn" style={{ padding: "8px 12px" }} onClick={() => setEditingGoal(false)}>cancel</button>
          </div>
        )}

        {/* Day tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 0 12px", scrollbarWidth: "none" }}>
          {days.map((d) => (
            <button key={d.id} className={`day-pill ${d.id === activeDayId ? "active" : ""}`} onClick={() => setActiveDayId(d.id)}>
              {d.date === getLocalDateString() ? "Today" : formatDate(d.date).split(",")[0]}
              <span style={{ marginLeft: 6, color: "#6a5a40" }}>{totalCals(d.meals)}</span>
            </button>
          ))}
          <button className="ghost-btn" onClick={addNewDay}>+ new day</button>
        </div>

        <div style={{ borderTop: "1px solid #164444", paddingTop: 4, marginBottom: 4 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#7ABFB8", margin: "10px 0 18px" }}>
            {activeDay ? formatDate(activeDay.date) : "—"}
          </p>
        </div>
      </div>

       {/* Meals */}
      <div style={{ width: "100%", maxWidth: 560, padding: "0 24px" }}>
        {activeDay?.meals.length === 0 && (
          <p style={{ color: "#164444", fontFamily: "'DM Sans', sans-serif", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
            no meals logged yet
          </p>
        )}

        {activeDay?.meals.map((meal) => (
          <div key={meal.id} className="meal-card fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{EMOJI_MAP[meal.type] || "✦"}</span>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, textTransform: "capitalize" }}>
                    {meal.type === "fast_break" ? "Breaking Fast" : meal.type}
                    {meal.time && <span style={{ color: "#7ABFB8", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>{meal.time}</span>}
                  </div>
                  {meal.note && <div style={{ color: "#7ABFB8", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 12, marginTop: 2 }}>{meal.note}</div>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#57FFD4" }}>
                  {meal.items.reduce((s, i) => s + (Number(i.calories) || 0), 0)} kcal
                </span>
                <button className="del-btn" onClick={() => deleteMeal(meal.id)}>×</button>
              </div>
            </div>

            {meal.items.map((item) => (
              <div key={item.id} className="item-row">
                {editingItem?.itemId === item.id ? (
                  <>
                    <input className="input-field" style={{ flex: 2, minWidth: 120 }} value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} />
                    <input className="input-field" style={{ flex: 1, minWidth: 70 }} value={editValues.amount}
                      onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })} />
                    <input className="input-field" style={{ flex: 1, minWidth: 60 }} type="number" value={editValues.calories}
                      onChange={(e) => setEditValues({ ...editValues, calories: e.target.value })} />
                    <button className="action-btn" style={{ padding: "4px 10px" }}
                      onClick={() => updateItem(meal.id, item.id)}>✓</button>
                    <button className="del-btn" onClick={() => setEditingItem(null)}>×</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{item.name}</span>
                    <span style={{ color: "#7ABFB8", fontFamily: "'DM Sans', sans-serif", fontSize: 12, minWidth: 50, textAlign: "right" }}>{item.amount}</span>
                    <span style={{ color: "#57FFD4", fontFamily: "'DM Sans', sans-serif", fontSize: 13, minWidth: 52, textAlign: "right" }}>{item.calories} kcal</span>
                    <button className="del-btn" onClick={() => {
                        setEditingItem({ mealId: meal.id, itemId: item.id });
                        setEditValues({ name: item.name, amount: item.amount, calories: item.calories });
                      }}>✎</button>
                    <button className="del-btn" onClick={() => deleteItem(meal.id, item.id)}>×</button>
                  </>
                )}
              </div>
            ))}

            {showAddItem === meal.id ? (
              <div className="fade-in" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input className="input-field" style={{ flex: 2, minWidth: 140 }} placeholder="food name" value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addItem(meal.id)} />
                  <input className="input-field" style={{ flex: 1, minWidth: 80 }} placeholder="amount" value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })} />
                  <input className="input-field" style={{ flex: 1, minWidth: 70 }} type="number" placeholder="kcal" value={newItem.calories}
                    onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addItem(meal.id)} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="action-btn" onClick={() => addItem(meal.id)}>add</button>
                  <button className="cancel-btn" onClick={() => { setShowAddItem(null); setNewItem({ name: "", amount: "", calories: "" }); }}>cancel</button>
                </div>
              </div>
            ) : (
              <button className="ghost-btn" style={{ marginTop: 10, width: "100%" }}
                onClick={() => setShowAddItem(meal.id)}>
                + add item
              </button>
            )}
          </div>
        ))}

        {/* Add meal form */}
        {showAddMeal ? (
          <div className="fade-in meal-card">
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontStyle: "italic", color: "#7ABFB8", margin: "0 0 12px" }}>new meal</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <select className="input-field" value={newMeal.type} onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })} style={{ flex: 1, minWidth: 130 }}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="fast_break">Breaking Fast</option>
                <option value="other">Other</option>
              </select>
              <input className="input-field" type="time" value={newMeal.time} onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })} style={{ flex: 1, minWidth: 100 }} />
            </div>
            <input className="input-field" style={{ width: "100%", marginBottom: 10 }} placeholder="note (optional)" value={newMeal.note}
              onChange={(e) => setNewMeal({ ...newMeal, note: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="action-btn" onClick={addMeal}>add meal</button>
              <button className="cancel-btn" onClick={() => setShowAddMeal(false)}>cancel</button>
            </div>
          </div>
        ) : (
          <button className="ghost-btn" style={{ width: "100%", padding: "12px", marginTop: 4 }} onClick={() => setShowAddMeal(true)}>
            + add meal
          </button>
        )}

        {/* Daily summary */}
        {activeDay && activeDay.meals.length > 0 && (
          <div style={{ marginTop: 24, background: "#0F3535", border: "1px solid #164444", borderRadius: 12, padding: "16px 20px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 12, color: "#7ABFB8", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              daily summary
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#7ABFB8" }}>{activeDay.meals.length} meal{activeDay.meals.length !== 1 ? "s" : ""} logged</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: dayCals > goalCals ? "#FF5C8A" : "#57FFD4" }}>
                {dayCals} <span style={{ fontSize: 13, color: "#7ABFB8" }}>kcal</span>
              </span>
            </div>
            <div style={{ marginTop: 10, height: 3, background: "#164444", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, transition: "width 0.6s ease",
                background: ringColor,
                width: `${Math.min(100, pct)}%`
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#164444" }}>0</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#164444" }}>goal {goalCals}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

