import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Users, Calendar, MapPin, Utensils } from "lucide-react";
import { format } from "date-fns";

interface TourManualData {
  tourCode: string;
  departureReference: string;
  clientCount: number;
  crewCount: number;
  roomingConfig: string;
  generalNotes: string;
  includedServices: string;
  includedActivities: string;
  notIncluded: string;
  borderCrossings: string;
  supplierReferences: Array<{
    name: string;
    status: "confirmed" | "pending";
    reference?: string;
    notes?: string;
  }>;
  itinerary: Array<{
    day: number;
    date: string;
    location: string;
    activity: string;
    accommodation: string;
    roomType: string;
    meals: {
      breakfast: "P" | "X";
      lunch: "P" | "X";
      dinner: "P" | "X";
    };
    notes?: string;
  }>;
  roomingList: Array<{
    roomNumber: string;
    roomType: string;
    clientName: string;
    bookingReference?: string;
  }>;
  flightDetails: Array<{
    flightNumber: string;
    arrivalDate: string;
    arrivalTime: string;
    totalPassengers: number;
    passengers: Array<{
      name: string;
      bookingReference: string;
    }>;
  }>;
}

const mealCodeLabels = {
  P: "Provided (by lodge/supplier)",
  X: "Own account"
};

export default function TourManualGenerator() {
  const [manualData, setManualData] = useState<TourManualData>({
    tourCode: "ZZK Series",
    departureReference: "ZZK250828R",
    clientCount: 13,
    crewCount: 2,
    roomingConfig: "3x Double, 2x Twin, 3x Single, 1x Twin (Nomad Crew)",
    generalNotes: `• Meals Codes:
o P = Provided (by lodge/supplier)
o X = Own account
• Vehicle: Overland truck with game drive use in national parks.
• Local Partners: 
Please call Swamp Stop to arrange the 4x4 shuttle transfer to lodge. 
Swamp Stop ; +26772610071

• Matopos NP : Rhino & Rock art
Black Rhino Safari ; cell: +263 714002169 / 71400216/ 772264416`,
    includedServices: `• All accommodation with private facilities.
• All breakfasts.
• Lunches: Day 13, Day 15, Day 16.
• Dinners: Day 12, Day 15, Day 16.
• All transport (overland truck + park game drives).
• Entrance fees as detailed below.`,
    includedActivities: `• Fish River Canyon
• Namib Naukluft National Park (2 days: Dune 45, Sossusvlei, Deadvlei, Sesriem)
• Cape Cross Seal Colony
• Himba Village
• Etosha National Park (2 days)
• Okavango Delta (2 days: Boat Cruise, Mokoro)
• Chobe National Park (2 days: Sunset Cruise, 4x4 game drive)
• Matobo Hills NP (Rhino Tracking & Rock Art)`,
    notIncluded: `• 4x4 shuttle at Sesriem/Sossusvlei
• Optional activities in Cape Town, Swakopmund, Victoria Falls
• Meals not specified
• Flights & airport transfers`,
    borderCrossings: `• South Africa → Namibia (Vioolsdrif/Nakop)
• Namibia → Botswana (Ngoma)
• Botswana → Zimbabwe (Kazungula)
• Zimbabwe → South Africa (Beitbridge)
Tour leader must:
• Assist with immigration forms, visas, entry fees.
• Allow buffer time at each border.`,
    supplierReferences: [
      { name: "The Fountains Hotel, Cape Town", status: "confirmed" },
      { name: "Okiep Country Lodge", status: "confirmed" },
      { name: "NWR Ai-Ais", status: "confirmed", reference: "Ref: 681139.1" },
      { name: "Hammerstein Lodge", status: "confirmed" },
      { name: "Dunedin Star, Swakopmund", status: "confirmed" },
      { name: "Toko Lodge, Kamanjab", status: "confirmed" },
      { name: "Halali, Etosha", status: "confirmed", reference: "Ref: 681141.1" },
      { name: "Kupferquelle, Etosha", status: "confirmed", notes: "confirmed (FB)" },
      { name: "Rainbow River Lodge", status: "confirmed" },
      { name: "Swamp Stop, Okavango", status: "confirmed" },
      { name: "Thebe River Safaris, Kasane", status: "confirmed" },
      { name: "VFA Rainbow Hotel", status: "confirmed" },
      { name: "Farmhouse Matopos, Bulawayo", status: "confirmed" },
      { name: "Mopane Bush Lodge, Musina", status: "confirmed" },
      { name: "Garden Court OR Tambo, Pretoria", status: "confirmed" }
    ],
    itinerary: [],
    roomingList: [],
    flightDetails: []
  });

  const generateTourManual = () => {
    const manual = `TOUR MANUAL – ${manualData.tourCode}
Tour Code: ${manualData.tourCode}
Departure Reference: ${manualData.departureReference}
Clients: ${manualData.clientCount} + ${manualData.crewCount} Crew
Rooming List: ${manualData.roomingConfig}
________________________________________

1. General Notes
${manualData.generalNotes}

________________________________________

2. Day-by-Day Itinerary
${manualData.itinerary.map(day => 
`Day ${day.day} – ${day.date} | ${day.location}
• Activity: ${day.activity}
• Accommodation: ${day.accommodation} – ${day.roomType} (${day.notes || 'Confirmed'})
• Meals: B: ${day.meals.breakfast} | L: ${day.meals.lunch} | D: ${day.meals.dinner}
${day.notes ? `• Notes: ${day.notes}` : ''}
________________________________________`
).join('\n')}

3. Included Services
${manualData.includedServices}

________________________________________

4. Included Entrance Fees & Activities
${manualData.includedActivities}

Not included:
${manualData.notIncluded}

________________________________________

5. Border Crossings
${manualData.borderCrossings}

________________________________________

6. Supplier Reference List
${manualData.supplierReferences.map(supplier => 
`• ${supplier.name} – ${supplier.status}${supplier.reference ? ` (${supplier.reference})` : ''}${supplier.notes ? ` (${supplier.notes})` : ''}`
).join('\n')}

________________________________________

Rooming List
${manualData.roomingList.map(room => 
`Room ${room.roomNumber}\t${room.roomType}\t${room.clientName}${room.bookingReference ? ` (${room.bookingReference})` : ''}`
).join('\n')}

${manualData.flightDetails.map(flight => 
`Arrival ${manualData.flightDetails.indexOf(flight) + 1}: Flight ${flight.flightNumber}
• Flight: ${flight.flightNumber} arriving at CPT 
• Arrival Date: ${flight.arrivalDate} 
• Arrival Time: ${flight.arrivalTime} 
• Total Passengers: ${flight.totalPassengers}
Clients:
${flight.passengers.map(passenger => 
`• ${passenger.name} (${passenger.bookingReference})`
).join('\n')}
________________________________________`
).join('\n')}

${manualData.flightDetails.length > 0 ? 'Attention Needed\n• Additional flight details as required\n' : ''}`;

    return manual;
  };

  const downloadManual = () => {
    const manual = generateTourManual();
    const blob = new Blob([manual], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tour_Manual_${manualData.tourCode}_${manualData.departureReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Tour Manual Generator</span>
            </CardTitle>
            <Button onClick={downloadManual}>
              <Download className="h-4 w-4 mr-2" />
              Download Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tour Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tour Code</label>
                <Input
                  value={manualData.tourCode}
                  onChange={(e) => setManualData({...manualData, tourCode: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Departure Reference</label>
                <Input
                  value={manualData.departureReference}
                  onChange={(e) => setManualData({...manualData, departureReference: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client Count</label>
                <Input
                  type="number"
                  value={manualData.clientCount}
                  onChange={(e) => setManualData({...manualData, clientCount: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Crew Count</label>
                <Input
                  type="number"
                  value={manualData.crewCount}
                  onChange={(e) => setManualData({...manualData, crewCount: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Rooming Configuration */}
            <div>
              <label className="text-sm font-medium">Rooming Configuration</label>
              <Input
                value={manualData.roomingConfig}
                onChange={(e) => setManualData({...manualData, roomingConfig: e.target.value})}
                placeholder="e.g., 3x Double, 2x Twin, 3x Single, 1x Twin (Nomad Crew)"
              />
            </div>

            {/* General Notes */}
            <div>
              <label className="text-sm font-medium">General Notes</label>
              <Textarea
                value={manualData.generalNotes}
                onChange={(e) => setManualData({...manualData, generalNotes: e.target.value})}
                rows={6}
                placeholder="Enter general notes for the tour..."
              />
            </div>

            {/* Included Services */}
            <div>
              <label className="text-sm font-medium">Included Services</label>
              <Textarea
                value={manualData.includedServices}
                onChange={(e) => setManualData({...manualData, includedServices: e.target.value})}
                rows={4}
                placeholder="List all included services..."
              />
            </div>

            {/* Included Activities */}
            <div>
              <label className="text-sm font-medium">Included Activities</label>
              <Textarea
                value={manualData.includedActivities}
                onChange={(e) => setManualData({...manualData, includedActivities: e.target.value})}
                rows={4}
                placeholder="List all included activities and entrance fees..."
              />
            </div>

            {/* Not Included */}
            <div>
              <label className="text-sm font-medium">Not Included</label>
              <Textarea
                value={manualData.notIncluded}
                onChange={(e) => setManualData({...manualData, notIncluded: e.target.value})}
                rows={3}
                placeholder="List what's not included..."
              />
            </div>

            {/* Border Crossings */}
            <div>
              <label className="text-sm font-medium">Border Crossings</label>
              <Textarea
                value={manualData.borderCrossings}
                onChange={(e) => setManualData({...manualData, borderCrossings: e.target.value})}
                rows={4}
                placeholder="List all border crossings and requirements..."
              />
            </div>

            {/* Supplier References */}
            <div>
              <label className="text-sm font-medium">Supplier References</label>
              <div className="space-y-2">
                {manualData.supplierReferences.map((supplier, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={supplier.name}
                      onChange={(e) => {
                        const newSuppliers = [...manualData.supplierReferences];
                        newSuppliers[index].name = e.target.value;
                        setManualData({...manualData, supplierReferences: newSuppliers});
                      }}
                      placeholder="Supplier name"
                    />
                    <select
                      value={supplier.status}
                      onChange={(e) => {
                        const newSuppliers = [...manualData.supplierReferences];
                        newSuppliers[index].status = e.target.value as "confirmed" | "pending";
                        setManualData({...manualData, supplierReferences: newSuppliers});
                      }}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                    <Input
                      value={supplier.reference || ""}
                      onChange={(e) => {
                        const newSuppliers = [...manualData.supplierReferences];
                        newSuppliers[index].reference = e.target.value;
                        setManualData({...manualData, supplierReferences: newSuppliers});
                      }}
                      placeholder="Reference"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSuppliers = manualData.supplierReferences.filter((_, i) => i !== index);
                        setManualData({...manualData, supplierReferences: newSuppliers});
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setManualData({
                      ...manualData,
                      supplierReferences: [...manualData.supplierReferences, { name: "", status: "pending" }]
                    });
                  }}
                >
                  Add Supplier
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            {generateTourManual()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
