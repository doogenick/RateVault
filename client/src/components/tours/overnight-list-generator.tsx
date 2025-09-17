import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Calendar, MapPin, Utensils, Bed } from "lucide-react";
import { format, addDays } from "date-fns";

interface OvernightEntry {
  day: number;
  date: string;
  start: string;
  end: string;
  activity: string;
  accommodation: string;
  type: string;
  breakfast: "0" | "1" | "X";
  lunch: "0" | "1" | "X";
  dinner: "0" | "1" | "X";
  notes?: string;
}

const mealCodeLabels = {
  "0": "MEAL INCLUDED",
  "1": "MEAL COOKED FROM TRUCK", 
  "X": "FOR CLIENT OWN EXPENSE"
};

const accommodationTypes = [
  "Dorm Rooms",
  "Camping", 
  "Twin Rooms",
  "Single Rooms",
  "Double Rooms",
  "Crew Rooms"
];

export default function OvernightListGenerator() {
  const [tourStartDate, setTourStartDate] = useState("2025-09-13");
  const [overnightEntries, setOvernightEntries] = useState<OvernightEntry[]>([
    {
      day: 0,
      date: "13-Sep-25",
      start: "Cape Town",
      end: "Cape Town", 
      activity: "0",
      accommodation: "Sunflower Stop",
      type: "Dorm Rooms",
      breakfast: "0",
      lunch: "0", 
      dinner: "0"
    },
    {
      day: 1,
      date: "15-Sep-25",
      start: "Cape Town",
      end: "Orange River",
      activity: "0",
      accommodation: "Fiddlers Creek",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 2,
      date: "16-Sep-25", 
      start: "Orange River",
      end: "Fish River Canyon",
      activity: "0",
      accommodation: "Hobas",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 3,
      date: "17-Sep-25",
      start: "Fish River Canyon", 
      end: "Sesriem",
      activity: "0",
      accommodation: "Sesriem Campsite",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 4,
      date: "18-Sep-25",
      start: "Sesriem",
      end: "Swakopmund",
      activity: "via Dune 45, Sossusvlei, Deadvlei, Sesriem Canyon. (Solitaire if time allows)",
      accommodation: "Amanpuri",
      type: "Dorm Rooms",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 5,
      date: "19-Sep-25",
      start: "Swakopmund",
      end: "Swakopmund",
      activity: "0",
      accommodation: "Amanpuri",
      type: "Dorm Rooms",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 6,
      date: "20-Sep-25",
      start: "Swakopmund",
      end: "Kamanjab",
      activity: "0",
      accommodation: "Duncn's Camp",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 7,
      date: "21-Sep-25",
      start: "Kamanjab",
      end: "Etosha NP",
      activity: "0",
      accommodation: "Okaukeujo",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 8,
      date: "22-Sep-25",
      start: "Etosha NP",
      end: "Etosha NP",
      activity: "0",
      accommodation: "Namutoni",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 9,
      date: "23-Sep-25",
      start: "Etosha NP",
      end: "Bagani",
      activity: "0",
      accommodation: "Ngepi Camp",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 10,
      date: "24-Sep-25",
      start: "Bagani",
      end: "Okavango Delta",
      activity: "0",
      accommodation: "Nguma Island Lodge",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 11,
      date: "25-Sep-25",
      start: "Okavango Delta",
      end: "Okavango Delta",
      activity: "0",
      accommodation: "Nguma Island Lodge",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 12,
      date: "26-Sep-25",
      start: "Okavango Delta",
      end: "Bagani / Caprivi",
      activity: "0",
      accommodation: "Shametu Campsite",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 13,
      date: "27-Sep-25",
      start: "Bagani / Caprivi",
      end: "Kasane",
      activity: "0",
      accommodation: "Thebe River Lodge",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 14,
      date: "28-Sep-25",
      start: "Kasane",
      end: "Victoria Falls",
      activity: "0",
      accommodation: "N1 Hotel & Campsite",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 15,
      date: "29-Sep-25",
      start: "Victoria Falls",
      end: "Victoria Falls",
      activity: "0",
      accommodation: "N1 Hotel & Campsite",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 16,
      date: "30-Sep-25",
      start: "Victoria Falls",
      end: "Bulawayo",
      activity: "0",
      accommodation: "Big Cave Camp",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 17,
      date: "1-Oct-25",
      start: "Bulawayo",
      end: "Tshipise",
      activity: "0",
      accommodation: "Mapesu",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 18,
      date: "2-Oct-25",
      start: "Tshipise",
      end: "Pretoria",
      activity: "0",
      accommodation: "Twana Lodge",
      type: "Dorm Rooms",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    },
    {
      day: 19,
      date: "3-Oct-25",
      start: "Pretoria",
      end: "Departure Jo' burg",
      activity: "0",
      accommodation: "0",
      type: "0",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    }
  ]);

  const updateDateFromStart = (startDate: string) => {
    const newEntries = overnightEntries.map((entry, index) => {
      const entryDate = addDays(new Date(startDate), entry.day);
      return {
        ...entry,
        date: format(entryDate, "d-MMM-yy")
      };
    });
    setOvernightEntries(newEntries);
  };

  const generateOvernightList = () => {
    const header = `Day\tDate\tStart\tEnd\tActivity\tAccommodation\tType\tBreakfast\tLunch\tDinner\tNotes`;
    const entries = overnightEntries.map(entry => 
      `${entry.day}\t${entry.date}\t${entry.start}\t${entry.end}\t${entry.activity}\t${entry.accommodation}\t${entry.type}\t${entry.breakfast}\t${entry.lunch}\t${entry.dinner}\t${entry.notes || ''}`
    ).join('\n');
    
    const footer = `\n\n-- 0 = MEAL INCLUDED 1= MEAL COOKED FROM TRUCK X= FOR CLIENT OWN EXPENSE`;
    
    return `${header}\n${entries}${footer}`;
  };

  const downloadOvernightList = () => {
    const list = generateOvernightList();
    const blob = new Blob([list], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Overnight_List_${tourStartDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addEntry = () => {
    const lastDay = Math.max(...overnightEntries.map(e => e.day));
    const newEntry: OvernightEntry = {
      day: lastDay + 1,
      date: format(addDays(new Date(tourStartDate), lastDay + 1), "d-MMM-yy"),
      start: "",
      end: "",
      activity: "0",
      accommodation: "",
      type: "Camping",
      breakfast: "0",
      lunch: "0",
      dinner: "0"
    };
    setOvernightEntries([...overnightEntries, newEntry]);
  };

  const removeEntry = (index: number) => {
    const newEntries = overnightEntries.filter((_, i) => i !== index);
    // Renumber days
    const renumberedEntries = newEntries.map((entry, i) => ({
      ...entry,
      day: i
    }));
    setOvernightEntries(renumberedEntries);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Overnight List Generator</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={addEntry}>
                <Calendar className="h-4 w-4 mr-2" />
                Add Day
              </Button>
              <Button onClick={downloadOvernightList}>
                <Download className="h-4 w-4 mr-2" />
                Download List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tour Start Date */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Tour Start Date:</label>
              <Input
                type="date"
                value={tourStartDate}
                onChange={(e) => {
                  setTourStartDate(e.target.value);
                  updateDateFromStart(e.target.value);
                }}
                className="w-48"
              />
            </div>

            {/* Meal Code Legend */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Meal Codes:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="font-mono">0</span> = {mealCodeLabels["0"]}</div>
                <div><span className="font-mono">1</span> = {mealCodeLabels["1"]}</div>
                <div><span className="font-mono">X</span> = {mealCodeLabels["X"]}</div>
              </div>
            </div>

            {/* Overnight Entries */}
            <div className="space-y-2">
              {overnightEntries.map((entry, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1">
                        <label className="text-xs font-medium">Day</label>
                        <Input
                          value={entry.day}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].day = parseInt(e.target.value) || 0;
                            setOvernightEntries(newEntries);
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">Date</label>
                        <Input
                          value={entry.date}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].date = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">Start</label>
                        <Input
                          value={entry.start}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].start = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">End</label>
                        <Input
                          value={entry.end}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].end = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-medium">Activity</label>
                        <Input
                          value={entry.activity}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].activity = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-medium">Accommodation</label>
                        <Input
                          value={entry.accommodation}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].accommodation = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">Type</label>
                        <select
                          value={entry.type}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].type = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          {accommodationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">B</label>
                        <select
                          value={entry.breakfast}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].breakfast = e.target.value as "0" | "1" | "X";
                            setOvernightEntries(newEntries);
                          }}
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="X">X</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">L</label>
                        <select
                          value={entry.lunch}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].lunch = e.target.value as "0" | "1" | "X";
                            setOvernightEntries(newEntries);
                          }}
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="X">X</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-medium">D</label>
                        <select
                          value={entry.dinner}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].dinner = e.target.value as "0" | "1" | "X";
                            setOvernightEntries(newEntries);
                          }}
                          className="w-full px-2 py-1 border rounded text-xs"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="X">X</option>
                        </select>
                      </div>
                      <div className="col-span-12">
                        <label className="text-xs font-medium">Notes</label>
                        <Input
                          value={entry.notes || ""}
                          onChange={(e) => {
                            const newEntries = [...overnightEntries];
                            newEntries[index].notes = e.target.value;
                            setOvernightEntries(newEntries);
                          }}
                          placeholder="Additional notes..."
                        />
                      </div>
                      <div className="col-span-12 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEntry(index)}
                        >
                          Remove Day
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Overnight List Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            {generateOvernightList()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
