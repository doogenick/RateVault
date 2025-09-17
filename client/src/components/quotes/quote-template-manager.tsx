import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Calculator,
  Download,
  Upload
} from "lucide-react";

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  tourType: 'FIT' | 'Group';
  duration: number;
  services: QuoteTemplateService[];
  formulas: QuoteFormula[];
  isActive: boolean;
  createdAt: string;
}

interface QuoteTemplateService {
  id: string;
  serviceType: 'accommodation' | 'activity' | 'transport' | 'meal' | 'park_fee' | 'other';
  serviceName: string;
  description: string;
  basePrice: number;
  currency: string;
  quantity: number;
  formula: string; // Excel-like formula
  isIncluded: boolean;
}

interface QuoteFormula {
  id: string;
  name: string;
  formula: string;
  description: string;
  variables: string[];
}

const defaultTemplates: QuoteTemplate[] = [
  {
    id: "1",
    name: "Classic Safari 7 Days",
    description: "Standard 7-day safari package",
    tourType: "Group",
    duration: 7,
    services: [
      {
        id: "1",
        serviceType: "accommodation",
        serviceName: "Lodge Accommodation",
        description: "3-star lodge accommodation",
        basePrice: 1200,
        currency: "ZAR",
        quantity: 1,
        formula: "=basePrice * paxCount * nights",
        isIncluded: true
      },
      {
        id: "2",
        serviceType: "activity",
        serviceName: "Game Drives",
        description: "Morning and afternoon game drives",
        basePrice: 450,
        currency: "ZAR",
        quantity: 1,
        formula: "=basePrice * paxCount * days",
        isIncluded: true
      },
      {
        id: "3",
        serviceType: "meal",
        serviceName: "Full Board",
        description: "Breakfast, lunch, and dinner",
        basePrice: 350,
        currency: "ZAR",
        quantity: 1,
        formula: "=basePrice * paxCount * days",
        isIncluded: true
      }
    ],
    formulas: [
      {
        id: "1",
        name: "Group Discount",
        formula: "=IF(paxCount >= 10, totalAmount * 0.1, 0)",
        description: "10% discount for groups of 10 or more",
        variables: ["paxCount", "totalAmount"]
      },
      {
        id: "2",
        name: "Seasonal Markup",
        formula: "=IF(season = 'Peak', totalAmount * 0.2, 0)",
        description: "20% markup during peak season",
        variables: ["season", "totalAmount"]
      }
    ],
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z"
  }
];

export default function QuoteTemplateManager() {
  const [templates, setTemplates] = useState<QuoteTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const calculateTemplatePrice = (template: QuoteTemplate, paxCount: number, season: string = 'Normal') => {
    let totalAmount = 0;
    
    template.services.forEach(service => {
      if (service.isIncluded) {
        // Simple calculation - in real app this would parse Excel formulas
        const price = service.basePrice * paxCount * template.duration;
        totalAmount += price;
      }
    });

    // Apply formulas
    template.formulas.forEach(formula => {
      if (formula.name === 'Group Discount' && paxCount >= 10) {
        totalAmount -= totalAmount * 0.1;
      }
      if (formula.name === 'Seasonal Markup' && season === 'Peak') {
        totalAmount += totalAmount * 0.2;
      }
    });

    return totalAmount;
  };

  const exportTemplate = (template: QuoteTemplate) => {
    // Create Excel file with template
    const data = {
      templateName: template.name,
      services: template.services.map(service => ({
        serviceType: service.serviceType,
        serviceName: service.serviceName,
        basePrice: service.basePrice,
        currency: service.currency,
        formula: service.formula
      })),
      formulas: template.formulas.map(formula => ({
        name: formula.name,
        formula: formula.formula,
        description: formula.description
      }))
    };

    // In real app, this would create an actual Excel file
    console.log("Exporting template:", data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quote Templates</h2>
        <Button onClick={() => setShowTemplateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="outline">{template.tourType}</Badge>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span>{template.duration} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Services:</span>
                  <span>{template.services.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Formulas:</span>
                  <span>{template.formulas.length}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Sample Price (10 pax):</span>
                  <span>ZAR {calculateTemplatePrice(template, 10).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportTemplate(template)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedTemplate.name}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Services */}
              <div>
                <h4 className="font-medium mb-3">Services</h4>
                <div className="space-y-2">
                  {selectedTemplate.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{service.serviceName}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <p className="text-xs text-gray-500">Formula: {service.formula}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{service.currency} {service.basePrice}</p>
                        <Badge variant={service.isIncluded ? "default" : "secondary"}>
                          {service.isIncluded ? "Included" : "Optional"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas */}
              <div>
                <h4 className="font-medium mb-3">Formulas</h4>
                <div className="space-y-2">
                  {selectedTemplate.formulas.map((formula) => (
                    <div key={formula.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{formula.name}</p>
                          <p className="text-sm text-gray-600">{formula.description}</p>
                        </div>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {formula.formula}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculator */}
              <div>
                <h4 className="font-medium mb-3">Price Calculator</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Pax Count</label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Season</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="Normal">Normal</option>
                      <option value="Peak">Peak</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Price</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-md">
                      ZAR {calculateTemplatePrice(selectedTemplate, 10).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
