import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Minus } from "lucide-react";

interface BookingRequestFormData {
  tourId: string;
  supplierId: string;
  accommodation: string;
  checkIn: string;
  checkOut: string;
  paxCount: number;
  roomType: string;
  roomConfiguration: string;
  mealPlan: string;
  specialRequests: string;
}

interface RoomConfiguration {
  roomType: string;
  quantity: number;
}

export default function BookingRequestForm({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void; 
  onSave: (data: BookingRequestFormData) => void; 
}) {
  const [formData, setFormData] = useState<BookingRequestFormData>({
    tourId: "",
    supplierId: "",
    accommodation: "",
    checkIn: "",
    checkOut: "",
    paxCount: 0,
    roomType: "",
    roomConfiguration: "",
    mealPlan: "BB",
    specialRequests: ""
  });

  const [roomConfigs, setRoomConfigs] = useState<RoomConfiguration[]>([
    { roomType: "Double", quantity: 0 },
    { roomType: "Twin", quantity: 0 },
    { roomType: "Single", quantity: 0 },
    { roomType: "Crew", quantity: 0 }
  ]);

  const mealPlans = [
    { value: "BB", label: "Bed & Breakfast" },
    { value: "HB", label: "Half Board" },
    { value: "FB", label: "Full Board" },
    { value: "AI", label: "All Inclusive" },
    { value: "RO", label: "Room Only" }
  ];

  const updateRoomConfiguration = () => {
    const config = roomConfigs
      .filter(room => room.quantity > 0)
      .map(room => `${room.quantity}x ${room.roomType}`)
      .join(", ");
    setFormData({...formData, roomConfiguration: config});
  };

  const updateRoomQuantity = (index: number, quantity: number) => {
    const newConfigs = [...roomConfigs];
    newConfigs[index].quantity = Math.max(0, quantity);
    setRoomConfigs(newConfigs);
    updateRoomConfiguration();
  };

  const calculateTotalPax = () => {
    return roomConfigs.reduce((total, room) => {
      const paxPerRoom = room.roomType === "Single" ? 1 : 2;
      return total + (room.quantity * paxPerRoom);
    }, 0);
  };

  const handleSave = () => {
    const totalPax = calculateTotalPax();
    onSave({
      ...formData,
      paxCount: totalPax
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>New Booking Request</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tour ID</label>
              <Input
                value={formData.tourId}
                onChange={(e) => setFormData({...formData, tourId: e.target.value})}
                placeholder="Select tour"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Supplier ID</label>
              <Input
                value={formData.supplierId}
                onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                placeholder="Select supplier"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Accommodation</label>
            <Input
              value={formData.accommodation}
              onChange={(e) => setFormData({...formData, accommodation: e.target.value})}
              placeholder="Accommodation name"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Check-in Date</label>
              <Input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-out Date</label>
              <Input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
              />
            </div>
          </div>

          {/* Room Configuration */}
          <div>
            <label className="text-sm font-medium">Room Configuration</label>
            <div className="space-y-2 mt-2">
              {roomConfigs.map((room, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm">{room.roomType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRoomQuantity(index, room.quantity - 1)}
                      disabled={room.quantity <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{room.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRoomQuantity(index, room.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {room.quantity * (room.roomType === "Single" ? 1 : 2)} pax
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <div className="text-sm">
                <strong>Total Pax:</strong> {calculateTotalPax()}
              </div>
              <div className="text-sm">
                <strong>Configuration:</strong> {formData.roomConfiguration || "None selected"}
              </div>
            </div>
          </div>

          {/* Room Type and Meal Plan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Room Type</label>
              <Input
                value={formData.roomType}
                onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                placeholder="e.g., Standard Room, Deluxe Suite"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meal Plan</label>
              <select
                value={formData.mealPlan}
                onChange={(e) => setFormData({...formData, mealPlan: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                {mealPlans.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="text-sm font-medium">Special Requests</label>
            <Textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
              rows={3}
              placeholder="Any special requests or notes for the supplier"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Booking Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
