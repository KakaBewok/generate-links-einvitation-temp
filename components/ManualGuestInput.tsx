"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";

//TODO
export default function ManualGuestInput() {
  const [name, setName] = useState("");
  const [guestList, setGuestList] = useState<string[]>([]);

  const addGuest = () => {
    const trimmed = name.trim();
    if (trimmed && !guestList.includes(trimmed)) {
      setGuestList([...guestList, trimmed]);
      setName("");
    }
  };

  const removeGuest = (index: number) => {
    const newList = [...guestList];
    newList.splice(index, 1);
    setGuestList(newList);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addGuest();
    }
  };

  const generateLinks = async () => {
    const payload = guestList.map((name) => ({
      name,
      invitationId: "abc123",
    }));

    const res = await fetch("/api/manual-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      alert("Tamu berhasil ditambahkan!");
    } else {
      alert("Gagal menambahkan tamu.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {guestList.map((guest, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-neutral-200 px-3 py-1 rounded-full text-sm"
          >
            {guest}
            <button onClick={() => removeGuest(index)}>
              <X className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ketik nama lalu tekan Enter"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={addGuest}>Tambah</Button>
      </div>
      <Button
        variant="default"
        onClick={generateLinks}
        disabled={guestList.length === 0}
      >
        Generate Link
      </Button>
    </div>
  );
}
