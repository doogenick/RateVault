import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Mail, FileText } from "lucide-react";

interface EmailTemplate {
  id?: string;
  name: string;
  type: "booking_request" | "confirmation" | "release";
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

const defaultTemplates = {
  booking_request: {
    name: "Provisional Booking Request",
    subject: "Provisional Booking Request - {{tourCode}} - {{supplierName}}",
    body: `Dear {{supplierName}},

Our client has provisionally confirmed the following tour and we would like to request provisional booking:

Tour Code: {{tourCode}}
Client: {{clientName}}
Check-in: {{checkIn}}
Check-out: {{checkOut}}
Pax: {{paxCount}}
Room Type: {{roomType}}
Room Configuration: {{roomConfiguration}}
Meal Plan: {{mealPlan}}

{{#if specialRequests}}
Special Requests: {{specialRequests}}
{{/if}}

Please confirm availability and provide confirmation number. This is a provisional booking pending final client confirmation.

Best regards,
Nomad Tours
Tel: +27 21 845 6310
Email: nicholas@nomadtours.co.za`,
    variables: [
      "tourCode", "supplierName", "clientName", "checkIn", "checkOut", 
      "paxCount", "roomType", "roomConfiguration", "mealPlan", "specialRequests"
    ]
  },
  confirmation: {
    name: "Final Booking Confirmation",
    subject: "Final Booking Confirmation - {{tourCode}} - {{confirmationNumber}}",
    body: `Dear {{supplierName}},

Our client has made final payment and we are confirming the following booking:

Tour Code: {{tourCode}}
Confirmation Number: {{confirmationNumber}}
Client: {{clientName}}
Check-in: {{checkIn}}
Check-out: {{checkOut}}
Pax: {{paxCount}}
Room Type: {{roomType}}
Room Configuration: {{roomConfiguration}}
Meal Plan: {{mealPlan}}

{{#if specialRequests}}
Special Requests: {{specialRequests}}
{{/if}}

This booking is now confirmed and guaranteed. We look forward to working with you.

Best regards,
Nomad Tours
Tel: +27 21 845 6310
Email: nicholas@nomadtours.co.za`,
    variables: [
      "tourCode", "supplierName", "confirmationNumber", "clientName", 
      "checkIn", "checkOut", "paxCount", "roomType", "roomConfiguration", 
      "mealPlan", "specialRequests"
    ]
  },
  release: {
    name: "Booking Release",
    subject: "Booking Release - {{tourCode}} - {{confirmationNumber}}",
    body: `Dear {{supplierName}},

Please release the following booking:

Tour Code: {{tourCode}}
Confirmation Number: {{confirmationNumber}}
Client: {{clientName}}
Check-in: {{checkIn}}
Check-out: {{checkOut}}

{{#if releaseReason}}
Reason: {{releaseReason}}
{{/if}}

Thank you for your understanding.

Best regards,
Nomad Tours`,
    variables: [
      "tourCode", "supplierName", "confirmationNumber", "clientName", 
      "checkIn", "checkOut", "releaseReason"
    ]
  }
};

export default function EmailTemplateEditor() {
  const [template, setTemplate] = useState<EmailTemplate>({
    name: "",
    type: "booking_request",
    subject: "",
    body: "",
    variables: [],
    isActive: true
  });

  const [previewData, setPreviewData] = useState({
    tourCode: "ZZK250828R",
    supplierName: "Movenpick Hotel",
    clientName: "Borcherds Group",
    checkIn: "2025-10-10",
    checkOut: "2025-10-11",
    paxCount: "13",
    roomType: "Standard Room",
    roomConfiguration: "5x Double, 1x Twin",
    mealPlan: "BB",
    specialRequests: "Vegetarian meals required",
    confirmationNumber: "298346",
    releaseReason: "Client cancellation"
  });

  const [showPreview, setShowPreview] = useState(false);

  const loadTemplate = (type: string) => {
    const defaultTemplate = defaultTemplates[type as keyof typeof defaultTemplates];
    if (defaultTemplate) {
      setTemplate({
        name: defaultTemplate.name,
        type: type as EmailTemplate["type"],
        subject: defaultTemplate.subject,
        body: defaultTemplate.body,
        variables: defaultTemplate.variables,
        isActive: true
      });
    }
  };

  const renderPreview = () => {
    let renderedSubject = template.subject;
    let renderedBody = template.body;

    // Replace variables with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, value || '');
      renderedBody = renderedBody.replace(regex, value || '');
    });

    // Handle conditional blocks (simplified)
    renderedBody = renderedBody.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
      return previewData[variable as keyof typeof previewData] ? content : '';
    });

    return { subject: renderedSubject, body: renderedBody };
  };

  const saveTemplate = () => {
    // Here you would save the template to the database
    console.log("Saving template:", template);
  };

  const preview = showPreview ? renderPreview() : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Template Editor</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button onClick={saveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Editor */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Template Type</label>
                <select
                  value={template.type}
                  onChange={(e) => loadTemplate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="booking_request">Booking Request</option>
                  <option value="confirmation">Confirmation</option>
                  <option value="release">Release</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={template.name}
                  onChange={(e) => setTemplate({...template, name: e.target.value})}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={template.subject}
                  onChange={(e) => setTemplate({...template, subject: e.target.value})}
                  placeholder="Email subject with variables like {{tourCode}}"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Body</label>
                <Textarea
                  value={template.body}
                  onChange={(e) => setTemplate({...template, body: e.target.value})}
                  rows={15}
                  placeholder="Email body with variables like {{clientName}}"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Available Variables</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            {showPreview && preview && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Preview Data</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(previewData).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-xs font-medium">{key}</label>
                        <Input
                          value={value}
                          onChange={(e) => setPreviewData({...previewData, [key]: e.target.value})}
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Rendered Email</label>
                  <div className="border rounded-md p-4 bg-gray-50">
                    <div className="mb-4">
                      <strong>Subject:</strong>
                      <p className="text-sm">{preview.subject}</p>
                    </div>
                    <div>
                      <strong>Body:</strong>
                      <pre className="text-sm whitespace-pre-wrap mt-2">{preview.body}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Library */}
      <Card>
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(defaultTemplates).map(([type, template]) => (
              <Card key={type} className="cursor-pointer hover:bg-gray-50" onClick={() => loadTemplate(type)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
