import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Users, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

interface Accommodation {
  name: string;
  address: string;
  website?: string;
  phone: string;
  bookingNumber: string;
  roomType: string;
  dateIn: string;
  dateOut: string;
  meals: string;
  notes?: string;
}

interface FlightDeparture {
  date: string;
  passengers: string;
  flightNumber: string;
  departureTime: string;
}

interface VoucherData {
  clientName: string;
  date: string;
  booking: string;
  departureDate: string;
  bookingReference: string;
  emergencyPhone1: string;
  emergencyPhone2: string;
  emergencyPhone3: string;
  nomadCrew: {
    driver: string;
    tourLeader: string;
  };
  passengers: Array<{
    roomNumber: string;
    roomType: string;
    names: string;
  }>;
  flightDepartures: FlightDeparture[];
  accommodations: Accommodation[];
}

export default function ConfirmationVoucherGenerator() {
  const [voucherData, setVoucherData] = useState<VoucherData>({
    clientName: "Borcherds Group",
    date: "2025-09-03",
    booking: "BEN101025",
    departureDate: "2025-10-10",
    bookingReference: "NMGR345232",
    emergencyPhone1: "+27 (0)21 845 7400",
    emergencyPhone2: "+27 (0)72 528 2613",
    emergencyPhone3: "",
    nomadCrew: {
      driver: "Driver",
      tourLeader: "Tour Leader"
    },
    passengers: [
      { roomNumber: "1", roomType: "Double", names: "Ray + Melinda Borcherds – sharing double" },
      { roomNumber: "2", roomType: "Double", names: "Alexa Borcherds and Sam Rundle" },
      { roomNumber: "3", roomType: "Double", names: "Glenn and Jenny Feltham" },
      { roomNumber: "4", roomType: "Double", names: "Jocelyn and Nadine Viger" },
      { roomNumber: "5", roomType: "Double", names: "Cameron Borcherds + 1" }
    ],
    flightDepartures: [
      {
        date: "2025-10-24",
        passengers: "2 pax (Nadine & Jocelyn)",
        flightNumber: "FA 755",
        departureTime: "15h50"
      },
      {
        date: "2025-10-25",
        passengers: "8 pax (Raymond, Melinda, Glenn, Jennifer, Cameron, Tara, Alexa and Sam)",
        flightNumber: "SA 41",
        departureTime: "14h20"
      }
    ],
    accommodations: [
      {
        name: "Movenpick Hotel",
        address: "Corner of Auas, 10005, and Aviation Road, Windhoek, Namibia",
        website: "https://all.accor.com/hotel/B960/index.en.shtml",
        phone: "+264 61 296 8000",
        bookingNumber: "298346",
        roomType: "Standard Room",
        dateIn: "2025-10-10",
        dateOut: "2025-10-11",
        meals: "breakfast"
      },
      {
        name: "Stay @ Swakop",
        address: "173 Anton Lubowski Street Kramersdorf Swakopmund namibia, Swakopmund, Namibia",
        website: "https://stay-at-swakop.com/",
        phone: "+264 81 634 5212",
        bookingNumber: "250204-003",
        roomType: "Standard Room",
        dateIn: "2025-10-11",
        dateOut: "2025-10-13",
        meals: "breakfast"
      },
      {
        name: "Brandberg White Lady Lodge",
        address: "D2359, Uis, Namibia",
        website: "www.brandbergwllodge.com",
        phone: "+264 81 791 3117",
        bookingNumber: "57030",
        roomType: "Standard Room",
        dateIn: "2025-10-13",
        dateOut: "2025-10-14",
        meals: "breakfast"
      },
      {
        name: "NWR: Okaukuejo Resort",
        address: "RWC9+8M6, Okaukuejo, Namibia",
        website: "https://www.nwr.com.na/resorts/okaukuejo-resort/",
        phone: "+264 61 285 7200",
        bookingNumber: "679462",
        roomType: "Standard Room – Bed & Breakfast",
        dateIn: "2025-10-14",
        dateOut: "2025-10-16",
        meals: "breakfast & dinner"
      },
      {
        name: "Sachsenheim Guest farm",
        address: "Southern Drakensberg, Drakensberg Gardens Road 3257",
        website: "https://www.sachsenheimguestfarm.com/",
        phone: "+031 001 8471",
        bookingNumber: "",
        roomType: "Standard Room– Bed & Breakfast",
        dateIn: "2025-10-16",
        dateOut: "2025-10-17",
        meals: "breakfast"
      },
      {
        name: "Shametu",
        address: "Bagani, Namibia",
        website: "www.shameturiverlodge.com",
        phone: "+264 66 259 035",
        bookingNumber: "SRL-250206-010",
        roomType: "Standard Room",
        dateIn: "2025-10-17",
        dateOut: "2025-10-18",
        meals: "breakfast & dinner"
      },
      {
        name: "Khwai River View",
        address: "Khwai Concession, Khwai, Botswana",
        phone: "+267 75 011 843",
        bookingNumber: "BEN101025",
        roomType: "Standard Room – Bed & Breakfast",
        dateIn: "2025-10-18",
        dateOut: "2025-10-20",
        meals: "breakfast, lunch & dinner"
      },
      {
        name: "Maun Lodge",
        address: "Plot 1471, Maun, Botswana",
        website: "https://maunlodge.com-hotel.website/",
        phone: "+267 686 3939",
        bookingNumber: "1073700",
        roomType: "Standard Room– Bed & Breakfast",
        dateIn: "2025-10-20",
        dateOut: "2025-10-21",
        meals: "breakfast & dinner"
      },
      {
        name: "Thebe River Lodge",
        address: "Lease Area 76, Kasane, Botswana",
        phone: "+267 625 0995",
        bookingNumber: "46368",
        roomType: "Standard Room– Bed & Breakfast",
        dateIn: "2025-10-21",
        dateOut: "2025-10-23",
        meals: "dinner & breakfast"
      },
      {
        name: "Nkosi Guest House",
        address: "Nkosi Guest Lodge, 504 Acacia Crescent, Victoria Falls, Zimbabwe",
        website: "https://www.thebayetecollection.com/nkosi/",
        phone: "+263 83 2847321",
        bookingNumber: "BEN101025",
        roomType: "Standard Room – Bed & Breakfast",
        dateIn: "2025-10-23",
        dateOut: "2025-10-25",
        meals: "breakfast",
        notes: "23 – 24 Oct 2025: 1 night Nkosi Guest House (Nadine & Jocelyn)\n23 – 25 Oct 2025: 2 nights Nkosi Guest House (Raymond, Melinda, Glenn, Jennifer, Cameron, Tara, Alexa and Sam)"
      }
    ]
  });

  const generateVoucher = () => {
    const voucher = `38 Chilwan Crescent, Helderberg Industrial Park, Somerset West, South Africa 7130.  TEL: +27 21 845 6310 / FAX: +27 21 845 4357 / Email: nicholas@nomadtours.co.za 

CONFIRMATION VOUCHER 

Nomad Emergency Telephone Number: 

NOMAD: ${voucherData.emergencyPhone1}, ${voucherData.emergencyPhone2}${voucherData.emergencyPhone3 ? `, ${voucherData.emergencyPhone3}` : ''} 

Client: ${voucherData.clientName} 

Date: ${format(new Date(voucherData.date), "d MMMM yyyy")} 

Booking: ${voucherData.booking} 

Departure Date: ${format(new Date(voucherData.departureDate), "d MMMM yyyy")} 

Booking Reference: 
${voucherData.bookingReference} 

${format(new Date(voucherData.departureDate), "d MMMM yyyy")}: 

Arrival transfer with Nomad truck.  

${voucherData.flightDepartures.map(flight => 
`${format(new Date(flight.date), "d MMMM  yyyy")}: 

${flight.passengers} fly out on ${format(new Date(flight.date), "d MMMM yyyy")} on Flight ${flight.flightNumber} departs ${flight.departureTime}. `
).join('\n')}

 Nomad Crew: 

${voucherData.nomadCrew.driver} 

${voucherData.nomadCrew.tourLeader} 

Passengers: ${voucherData.passengers.length}x Double / twin rooms 

 ${voucherData.passengers.length}x double rooms 

${voucherData.passengers.map(passenger => 
`${passenger.names} – sharing ${passenger.roomType.toLowerCase()}`
).join('\n')} 

 

ACCOMMODATION 

${voucherData.accommodations.map(accommodation => 
`Accommodation:                      ${accommodation.name} 

${accommodation.address} 
${accommodation.website ? accommodation.website + '\n' : ''}Tel: ${accommodation.phone} 

Booking Number: ${accommodation.bookingNumber} 

 
Type                      ${accommodation.roomType}  

Date in:                  ${format(new Date(accommodation.dateIn), "d MMMM yyyy")} 
Date out:               ${format(new Date(accommodation.dateOut), "d MMMM yyyy")} 

 

Meal included – ${accommodation.meals}  

${accommodation.notes ? accommodation.notes + '\n\n' : ''}`
).join('\n')}`;

    return voucher;
  };

  const downloadVoucher = () => {
    const voucher = generateVoucher();
    const blob = new Blob([voucher], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Confirmation_Voucher_${voucherData.booking}_${voucherData.clientName.replace(/\s+/g, '_')}.txt`;
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
              <span>Confirmation Voucher Generator</span>
            </CardTitle>
            <Button onClick={downloadVoucher}>
              <Download className="h-4 w-4 mr-2" />
              Download Voucher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input
                  value={voucherData.clientName}
                  onChange={(e) => setVoucherData({...voucherData, clientName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={voucherData.date}
                  onChange={(e) => setVoucherData({...voucherData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Booking</label>
                <Input
                  value={voucherData.booking}
                  onChange={(e) => setVoucherData({...voucherData, booking: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Departure Date</label>
                <Input
                  type="date"
                  value={voucherData.departureDate}
                  onChange={(e) => setVoucherData({...voucherData, departureDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Booking Reference</label>
                <Input
                  value={voucherData.bookingReference}
                  onChange={(e) => setVoucherData({...voucherData, bookingReference: e.target.value})}
                />
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <label className="text-sm font-medium">Emergency Phone Numbers</label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  value={voucherData.emergencyPhone1}
                  onChange={(e) => setVoucherData({...voucherData, emergencyPhone1: e.target.value})}
                  placeholder="Primary emergency number"
                />
                <Input
                  value={voucherData.emergencyPhone2}
                  onChange={(e) => setVoucherData({...voucherData, emergencyPhone2: e.target.value})}
                  placeholder="Secondary emergency number"
                />
                <Input
                  value={voucherData.emergencyPhone3}
                  onChange={(e) => setVoucherData({...voucherData, emergencyPhone3: e.target.value})}
                  placeholder="Additional emergency number"
                />
              </div>
            </div>

            {/* Nomad Crew */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Driver</label>
                <Input
                  value={voucherData.nomadCrew.driver}
                  onChange={(e) => setVoucherData({
                    ...voucherData, 
                    nomadCrew: {...voucherData.nomadCrew, driver: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tour Leader</label>
                <Input
                  value={voucherData.nomadCrew.tourLeader}
                  onChange={(e) => setVoucherData({
                    ...voucherData, 
                    nomadCrew: {...voucherData.nomadCrew, tourLeader: e.target.value}
                  })}
                />
              </div>
            </div>

            {/* Passengers */}
            <div>
              <label className="text-sm font-medium">Passengers</label>
              <div className="space-y-2">
                {voucherData.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={passenger.roomNumber}
                      onChange={(e) => {
                        const newPassengers = [...voucherData.passengers];
                        newPassengers[index].roomNumber = e.target.value;
                        setVoucherData({...voucherData, passengers: newPassengers});
                      }}
                      placeholder="Room #"
                      className="w-20"
                    />
                    <select
                      value={passenger.roomType}
                      onChange={(e) => {
                        const newPassengers = [...voucherData.passengers];
                        newPassengers[index].roomType = e.target.value;
                        setVoucherData({...voucherData, passengers: newPassengers});
                      }}
                      className="px-3 py-2 border rounded-md w-32"
                    >
                      <option value="Double">Double</option>
                      <option value="Twin">Twin</option>
                      <option value="Single">Single</option>
                    </select>
                    <Input
                      value={passenger.names}
                      onChange={(e) => {
                        const newPassengers = [...voucherData.passengers];
                        newPassengers[index].names = e.target.value;
                        setVoucherData({...voucherData, passengers: newPassengers});
                      }}
                      placeholder="Passenger names"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPassengers = voucherData.passengers.filter((_, i) => i !== index);
                        setVoucherData({...voucherData, passengers: newPassengers});
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setVoucherData({
                      ...voucherData,
                      passengers: [...voucherData.passengers, { roomNumber: "", roomType: "Double", names: "" }]
                    });
                  }}
                >
                  Add Passenger
                </Button>
              </div>
            </div>

            {/* Flight Departures */}
            <div>
              <label className="text-sm font-medium">Flight Departures</label>
              <div className="space-y-2">
                {voucherData.flightDepartures.map((flight, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input
                      type="date"
                      value={flight.date}
                      onChange={(e) => {
                        const newFlights = [...voucherData.flightDepartures];
                        newFlights[index].date = e.target.value;
                        setVoucherData({...voucherData, flightDepartures: newFlights});
                      }}
                    />
                    <Input
                      value={flight.passengers}
                      onChange={(e) => {
                        const newFlights = [...voucherData.flightDepartures];
                        newFlights[index].passengers = e.target.value;
                        setVoucherData({...voucherData, flightDepartures: newFlights});
                      }}
                      placeholder="Passengers"
                    />
                    <Input
                      value={flight.flightNumber}
                      onChange={(e) => {
                        const newFlights = [...voucherData.flightDepartures];
                        newFlights[index].flightNumber = e.target.value;
                        setVoucherData({...voucherData, flightDepartures: newFlights});
                      }}
                      placeholder="Flight number"
                    />
                    <div className="flex space-x-1">
                      <Input
                        value={flight.departureTime}
                        onChange={(e) => {
                          const newFlights = [...voucherData.flightDepartures];
                          newFlights[index].departureTime = e.target.value;
                          setVoucherData({...voucherData, flightDepartures: newFlights});
                        }}
                        placeholder="Time"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFlights = voucherData.flightDepartures.filter((_, i) => i !== index);
                          setVoucherData({...voucherData, flightDepartures: newFlights});
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setVoucherData({
                      ...voucherData,
                      flightDepartures: [...voucherData.flightDepartures, { date: "", passengers: "", flightNumber: "", departureTime: "" }]
                    });
                  }}
                >
                  Add Flight Departure
                </Button>
              </div>
            </div>

            {/* Accommodations */}
            <div>
              <label className="text-sm font-medium">Accommodations</label>
              <div className="space-y-4">
                {voucherData.accommodations.map((accommodation, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={accommodation.name}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].name = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            value={accommodation.phone}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].phone = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Address</label>
                          <Textarea
                            value={accommodation.address}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].address = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Website</label>
                          <Input
                            value={accommodation.website || ""}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].website = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Booking Number</label>
                          <Input
                            value={accommodation.bookingNumber}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].bookingNumber = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Room Type</label>
                          <Input
                            value={accommodation.roomType}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].roomType = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date In</label>
                          <Input
                            type="date"
                            value={accommodation.dateIn}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].dateIn = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date Out</label>
                          <Input
                            type="date"
                            value={accommodation.dateOut}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].dateOut = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Meals</label>
                          <Input
                            value={accommodation.meals}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].meals = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                            placeholder="e.g., breakfast, breakfast & dinner"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            value={accommodation.notes || ""}
                            onChange={(e) => {
                              const newAccommodations = [...voucherData.accommodations];
                              newAccommodations[index].notes = e.target.value;
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                            rows={2}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newAccommodations = voucherData.accommodations.filter((_, i) => i !== index);
                              setVoucherData({...voucherData, accommodations: newAccommodations});
                            }}
                          >
                            Remove Accommodation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setVoucherData({
                      ...voucherData,
                      accommodations: [...voucherData.accommodations, {
                        name: "",
                        address: "",
                        phone: "",
                        bookingNumber: "",
                        roomType: "",
                        dateIn: "",
                        dateOut: "",
                        meals: ""
                      }]
                    });
                  }}
                >
                  Add Accommodation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            {generateVoucher()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
