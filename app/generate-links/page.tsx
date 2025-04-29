"use client";

import React, { useEffect, useState } from "react";

const InvitationLinkGenerator: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<string>("");
  const [generatedLinks, setGeneratedLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>("");

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
  }, []);

  console.log("state guests: ", guests);

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
        setGeneratedLinks(result.data);
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

  console.log(generatedLinks.length);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Generate Invitation Links</h2>

      <div className="mb-4">
        <label htmlFor="invitationSelect" className="block text-gray-700">
          Select Invitation
        </label>
        <select
          id="invitationSelect"
          value={selectedInvitation}
          onChange={(e) => handleInvitationChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
        >
          <option value="">-- Select Invitation --</option>
          {invitations.map((invitation) => (
            <option key={invitation.id} value={invitation.id}>
              {invitation.event_name} ({invitation.event_date})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading guests...</p>
      ) : (
        <button
          onClick={generateLinks}
          className="bg-blue-500 text-white p-2 rounded-md"
          disabled={!selectedInvitation}
        >
          Generate Links
        </button>
      )}

      <div className="mt-6">
        {copySuccess && <p className="text-green-500">{copySuccess}</p>}

        {generatedLinks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold">Generated Links:</h3>
            <ul className="space-y-2 mt-4">
              {generatedLinks.map((link, index) => (
                <li
                  key={index}
                  className="bg-yellow-400 flex justify-between items-center"
                >
                  <div className="flex space-x-2">
                    {link.to}
                    <button
                      onClick={() => copyToClipboard(link.template)}
                      className="text-sm text-white bg-green-500 p-1 rounded-md"
                    >
                      Copy
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationLinkGenerator;
