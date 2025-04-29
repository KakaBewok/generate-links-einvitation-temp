"use client";

import { Meteors } from "@/components/ui/meteors";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ClipboardCopy } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const InvitationLinkGenerator: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<string>("");
  const [generatedMessages, setGeneratedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [domLoaded, setDomLoaded] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [indexCopied, setIndexCopied] = useState<number | null>(null);

  const handleCopy = (template: string, index: number) => {
    copyToClipboard(template);
    setIndexCopied(index);
    setCopied(true);

    // Reset icon setelah 3 detik
    setTimeout(() => {
      setIndexCopied(null);
    }, 3000);

    setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch("/api/invitations");
        if (response.ok) {
          const data = await response.json();
          setInvitations(data);
        } else {
          console.error("Failed to fetch invitations");
        }
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };
    fetchInvitations();

    setDomLoaded(true);
  }, []);

  const handleInvitationChange = async (invitationId: string) => {
    setSelectedInvitation(invitationId);
    setLoading(true);
    try {
      const response = await fetch(`/api/guests/${invitationId}`);

      if (response.ok) {
        const data = await response.json();
        console.log("response guests: ", data);
        setGuests(data.data);
      } else {
        console.error("Failed to fetch guests");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching guests:", error);
      setLoading(false);
    }
  };

  const generateLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          invitation_id: selectedInvitation,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("ini response gen links", result.data);
        setGeneratedMessages(result.data);
      } else {
        console.error("Error generating links");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error generating links:", error);
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link).then(
      () => setCopySuccess("Copied!"),
      () => setCopySuccess("Failed to copy link")
    );
  };

  return (
    <div className="max-w-3xl py-12 px-3 mx-auto">
      <div className="flex justify-between gap-4 mb-4 max-w-xl mx-auto">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 transition"
        >
          ⬅️ Home
        </Link>
        <Link
          href="/upload-guest"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 transition"
        >
          ⬅️ Upload Guest List
        </Link>
      </div>
      <div className="mx-auto relative w-full max-w-xl">
        <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-2xl" />
        <div className="relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-4 py-8 shadow-xl">
          <h1 className="relative z-50 mb-4 text-xl font-bold text-white">
            Generate Invitation Messages
          </h1>

          <div className="mb-5 w-full text-white bg-slate-800">
            <Select
              value={selectedInvitation ?? ""}
              onValueChange={handleInvitationChange}
            >
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Select Invitation" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="kkh">Select Invitation</SelectItem>
                  {invitations.map((invitation) => (
                    <SelectItem key={invitation.id} value={invitation.id}>
                      {invitation.event_name} ({invitation.event_date})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={generateLinks}
            className="bg-sky-600 hover:bg-sky-700 transition-colors duration-300 cursor-pointer text-white p-2 rounded-md w-full"
            disabled={!selectedInvitation}
          >
            {loading ? "Loading..." : "Generate Messages"}
          </button>

          {domLoaded && <Meteors number={30} />}
        </div>
      </div>

      <div className="mt-6">
        {generatedMessages.length > 0 && (
          <div className="mx-auto relative w-full max-w-xl ">
            <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
            <div className="relative flex h-full flex-col items-start justify-end overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-4 py-8 shadow-xl">
              <h1 className="relative z-50 mb-1 text-xl font-bold text-white">
                Your Invitation Messages! 💕
              </h1>
              <p className="text-slate-400 text-xs mb-10">
                This list of invitation messages is temporary, if the browser is
                reloaded or refreshed, the data will be lost and must be
                regenerated.
              </p>

              <ul className="w-full flex flex-col gap-4">
                {generatedMessages.map((link, index) => (
                  <li
                    key={index}
                    className="hover:bg-sky-200 cursor-pointer flex justify-between items-center bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex gap-2 items-center">
                      <span>{index + 1}. </span>
                      <div className="text-sm text-gray-700 dark:text-gray-100 font-semibold">
                        <span className="font-semibold">To:</span> {link.to}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(link.template, index)}
                      className={`cursor-pointer ml-4 p-2 rounded-md transition-colors duration-200 ${
                        indexCopied == index
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200  dark:bg-gray-700 "
                      }`}
                    >
                      {indexCopied == index ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ClipboardCopy className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {domLoaded && <Meteors number={30} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationLinkGenerator;
