"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Athlete = {
  id: string;
  name: string;
  country: string;
};

const initialAthletes: Athlete[] = [
  { id: "1", name: "Jayson Hopper", country: "USA" },
  { id: "2", name: "Roman Khrennikov", country: "Neutral" },
  { id: "3", name: "Dallin Pepper", country: "USA" },
  { id: "4", name: "Jeffrey Adler", country: "Canada" },
  { id: "5", name: "Ricky Garard", country: "Australia" },
  { id: "6", name: "James Sprague", country: "USA" },
  { id: "7", name: "Patrick Vellner", country: "Canada" },
  { id: "8", name: "Justin Medeiros", country: "USA" },
];

function SortableAthlete({
  athlete,
  position,
}: {
  athlete: Athlete;
  position: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: athlete.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-bold text-white">
        {position}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zinc-900">{athlete.name}</p>
        <p className="text-sm text-zinc-500">{athlete.country}</p>
      </div>

      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-lg px-3 py-2 text-2xl text-zinc-500 hover:bg-zinc-100 active:cursor-grabbing"
        aria-label={`Move ${athlete.name}`}
      >
        ☰
      </button>
    </div>
  );
}

export default function Home() {

  async function submitPrediction() {
  const trimmedName = playerName.trim();

  if (!trimmedName) {
    setStatus("error");
    setErrorMessage("Please enter your name.");
    return;
  }

  setStatus("saving");
  setErrorMessage("");

  const ranking = athletes.map((athlete, index) => ({
    athlete_id: athlete.id,
    athlete_name: athlete.name,
    position: index + 1,
  }));

  const { error } = await supabase.from("predictions").insert({
    player_name: trimmedName,
    ranking,
  });

  if (error) {
    console.error(error);
    setStatus("error");
    setErrorMessage(error.message);
    return;
  }

  setStatus("success");
}

  const [athletes, setAthletes] = useState(initialAthletes);
  const [playerName, setPlayerName] = useState("");
const [status, setStatus] = useState<
  "idle" | "saving" | "success" | "error"
>("idle");
const [errorMessage, setErrorMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setAthletes((currentAthletes) => {
      const oldIndex = currentAthletes.findIndex(
        (athlete) => athlete.id === active.id
      );
      const newIndex = currentAthletes.findIndex(
        (athlete) => athlete.id === over.id
      );

      return arrayMove(currentAthletes, oldIndex, newIndex);
    });
    setStatus("idle");
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-600">
            CrossFit Games Predictor
          </p>

          <h1 className="text-4xl font-black tracking-tight text-zinc-900">
            Rank the athletes
          </h1>

          <p className="mt-3 text-zinc-600">
            Drag the athletes into your predicted finishing order.
          </p>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={athletes.map((athlete) => athlete.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {athletes.map((athlete, index) => (
                <SortableAthlete
                  key={athlete.id}
                  athlete={athlete}
                  position={index + 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

<div className="mt-8">
  <label
    htmlFor="playerName"
    className="mb-2 block font-semibold text-zinc-900"
  >
    Your name
  </label>

  <input
    id="playerName"
    value={playerName}
    onChange={(event) => {
      setPlayerName(event.target.value);
      setStatus("idle");
    }}
    placeholder="Marc"
    className="mb-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-orange-600"
  />

  <button
    onClick={submitPrediction}
    disabled={status === "saving"}
    className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {status === "saving" ? "Saving..." : "Submit prediction"}
  </button>

  {status === "success" && (
    <p className="mt-4 rounded-xl bg-green-100 p-4 text-center font-semibold text-green-800">
      Your prediction was saved!
    </p>
  )}

  {status === "error" && (
    <p className="mt-4 rounded-xl bg-red-100 p-4 text-center font-semibold text-red-800">
      {errorMessage}
    </p>
  )}
</div>
      </div>
    </main>
  );
}