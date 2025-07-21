import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import {
  Plus,
  Minus,
  Printer,
  Download,
  Save,
  FolderOpen,
  Upload,
  X,
} from "lucide-react";
import { mockFormData } from "../data/mockData";
import LOGO_BASE64 from "../assets/logo";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ServiceForm = () => {
  const [formData, setFormData] = useState(mockFormData);
  const [customApplications, setCustomApplications] = useState([]);
  const [savedForms, setSavedForms] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [logoImage, setLogoImage] = useState(null);
  const fileInputRef = useRef(null);

  // Load saved forms from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("serviceFormsSaved");
    if (saved) {
      setSavedForms(JSON.parse(saved));
    }

    // Load saved logo
    const savedLogo = localStorage.getItem("serviceFormLogo");
    if (savedLogo) {
      setLogoImage(savedLogo);
    }
  }, []);

  // Auto-save form data to localStorage
  useEffect(() => {
    localStorage.setItem(
      "serviceFormCurrent",
      JSON.stringify({ formData, customApplications, logoImage })
    );
  }, [formData, customApplications, logoImage]);

  // Load current form data from localStorage on mount
  useEffect(() => {
    const current = localStorage.getItem("serviceFormCurrent");
    if (current) {
      const parsed = JSON.parse(current);
      setFormData(parsed.formData || mockFormData);
      setCustomApplications(parsed.customApplications || []);
      setLogoImage(parsed.logoImage || null);
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      // Menüden "PDF Dışa Aktar" tıklandığında
      window.electronAPI.onMenuExportPDF(() => {
        handleDownloadPDF();
      });

      // Menüden "Yeni Form" tıklandığında
      window.electronAPI.onMenuNewForm(() => {
        clearCurrentForm();
      });

      // Menüden "Kaydet" tıklandığında
      window.electronAPI.onMenuSaveForm(() => {
        saveForm();
      });

      // Menüden "Yazdır" tıklandığında
      window.electronAPI.onTriggerPrint(() => {
        handlePrint();
      });
    }

    // Cleanup: Dinleyicileri kaldır
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners("menu-export-pdf");
        window.electronAPI.removeAllListeners("menu-new-form");
        window.electronAPI.removeAllListeners("menu-save-form");
        window.electronAPI.removeAllListeners("trigger-print");
      }
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({
      ...prev,
      applications: {
        ...prev.applications,
        [field]: checked,
      },
    }));
  };

  const addCustomApplication = () => {
    setCustomApplications((prev) => [
      ...prev,
      { id: Date.now(), name: "", checked: false },
    ]);
  };

  const removeCustomApplication = (id) => {
    setCustomApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const handleCustomApplicationChange = (id, field, value) => {
    setCustomApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, [field]: value } : app))
    );
  };

  const handlePrint = async () => {
    const element = document.querySelector(".max-w-4xl");

    // Ölçek uygula
    element.style.transform = "scale(0.8)";
    element.style.transformOrigin = "top left";

    // Biraz bekle
    await new Promise((resolve) => setTimeout(resolve, 100));

    window.print();

    // Eski haline döndür
    element.style.transform = "";
    element.style.transformOrigin = "";
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      // Hide buttons
      const buttons = document.querySelectorAll(".print\\:hidden");
      buttons.forEach((btn) => (btn.style.display = "none"));

      const element = document.querySelector(".max-w-4xl");

      // Render DOM to canvas
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY, // fix scroll offset
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // Get image dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate scaling factor to fit all content on one page
      const scaleFactor = Math.min(
        pdfWidth / imgProps.width,
        pdfHeight / imgProps.height
      );

      const imgWidth = imgProps.width * scaleFactor;
      const imgHeight = imgProps.height * scaleFactor;

      // Center the image
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);

      // Generate filename with current date
      const now = new Date();
      const filename = `servis_bakim_formu_${
        now.toISOString().split("T")[0]
      }.pdf`;

      // Save PDF
      pdf.save(filename);

      // Show buttons again
      buttons.forEach((btn) => (btn.style.display = ""));
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      alert("PDF oluşturulurken bir hata oluştu");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const saveForm = () => {
    const formName = prompt("Form adı girin:");
    if (formName) {
      const newForm = {
        id: Date.now(),
        name: formName,
        date: new Date().toISOString(),
        data: formData,
        customApplications: customApplications,
      };

      const updated = [...savedForms, newForm];
      setSavedForms(updated);
      localStorage.setItem("serviceFormsSaved", JSON.stringify(updated));
      alert("Form kaydedildi!");
    }
  };

  const loadForm = (savedForm) => {
    setFormData(savedForm.data);
    setCustomApplications(savedForm.customApplications || []);
    alert(`"${savedForm.name}" formu yüklendi!`);
  };

  const deleteForm = (id) => {
    if (confirm("Bu formu silmek istediğinizden emin misiniz?")) {
      const updated = savedForms.filter((form) => form.id !== id);
      setSavedForms(updated);
      localStorage.setItem("serviceFormsSaved", JSON.stringify(updated));
    }
  };

  const clearCurrentForm = () => {
    if (confirm("Mevcut formu temizlemek istediğinizden emin misiniz?")) {
      setFormData(mockFormData);
      setCustomApplications([]);
      localStorage.removeItem("serviceFormCurrent");
    }
  };

  const predefinedApplications = [
    { key: "antivirus", label: "Antivirüs", category: "mandatory" },
    { key: "officeApps", label: "Office Uygulamaları", category: "mandatory" },
    { key: "writer", label: "Yazıcı", category: "mandatory" },
    { key: "pdfViewer", label: "PDF Görüntüleyici", category: "mandatory" },
    { key: "winrar", label: "Winrar", category: "mandatory" },
    {
      key: "windowsUpdates",
      label: "Windows Güncellemeleri",
      category: "mandatory",
    },
    { key: "java", label: "Java", category: "mandatory" },
    { key: "localPassword", label: "Lokal Parola", category: "mandatory" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Saved Forms Panel */}
      {savedForms.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5" />
                <span>Kayıtlı Formlar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedForms.map((form) => (
                  <div key={form.id} className="border rounded-lg p-3 bg-white">
                    <h4 className="font-semibold truncate">{form.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(form.date).toLocaleDateString("tr-TR")}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadForm(form)}
                        className="flex-1"
                      >
                        Yükle
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteForm(form.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-4xl mx-auto bg-white print:p-0 print:max-w-none print:bg-white">
        <div className="border-2 border-black print:border-black">
          {/* Header */}
          <div className="border-b-2 border-black p-3 print:p-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {/* Sabit logo - İki seçenek */}
                  <img
                    src="/images/logo.png"
                    alt="Kartepe Belediyesi Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Dosya bulunamazsa base64 logo dene
                      e.target.src = LOGO_BASE64;
                      e.target.onerror = () => {
                        // Her ikisi de yoksa varsayılan metni göster
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      };
                    }}
                  />
                  <div className="text-xs font-bold text-center text-gray-600 hidden">
                    KARTEPE
                    <br />
                    BELEDİYESİ
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold print:text-sm">
                    SERVİS BAKIM FORMU
                  </h1>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center space-x-2">
                  <Label className="font-bold text-sm print:text-xs">
                    Teslim Alınma Tarihi:
                  </Label>
                  <Input
                    type="date"
                    value={formData.receiveDate}
                    onChange={(e) =>
                      handleInputChange("receiveDate", e.target.value)
                    }
                    className="w-32 h-8 print:border-none print:bg-transparent print:text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="font-bold text-sm print:text-xs">
                    Teslim Edilme Tarihi:
                  </Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      handleInputChange("deliveryDate", e.target.value)
                    }
                    className="w-32 h-8 print:border-none print:bg-transparent print:text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="font-bold text-sm print:text-xs">
                    Servis Bakım No:
                  </Label>
                  <Input
                    value={formData.serviceNumber}
                    onChange={(e) =>
                      handleInputChange("serviceNumber", e.target.value)
                    }
                    className="w-32 h-8 print:border-none print:bg-transparent print:text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personel Information */}
          <div className="border-b-2 border-black">
            <div className="flex">
              <div className="w-1/2 border-r-2 border-black p-3 print:p-1">
                <h2 className="font-bold text-center mb-3 bg-gray-200 py-1 text-sm print:text-xs">
                  PERSONEL BİLGİLERİ
                </h2>
                <div className="space-y-2">
                  <div>
                    <Label className="font-bold text-sm print:text-xs">
                      *Birim/Kullanıcı:
                    </Label>
                    <Input
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      className="mt-1 h-8 print:border-none print:bg-transparent print:text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-sm print:text-xs">
                      *İletişim:
                    </Label>
                    <Input
                      value={formData.contact}
                      onChange={(e) =>
                        handleInputChange("contact", e.target.value)
                      }
                      className="mt-1 h-8 print:border-none print:bg-transparent print:text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-sm print:text-xs">
                      *İletişim Kurulacak Personel Adı:
                    </Label>
                    <Input
                      value={formData.contactPerson}
                      onChange={(e) =>
                        handleInputChange("contactPerson", e.target.value)
                      }
                      className="mt-1 h-8 print:border-none print:bg-transparent print:text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="w-1/2 p-3 print:p-1">
                <h2 className="font-bold text-center mb-3 bg-gray-200 py-1 text-sm print:text-xs">
                  ARIZA TANIMI
                </h2>
                <div className="space-y-2">
                  <div>
                    <Label className="font-bold text-sm print:text-xs">
                      *Cihazın Markası:
                    </Label>
                    <Input
                      value={formData.deviceBrand}
                      onChange={(e) =>
                        handleInputChange("deviceBrand", e.target.value)
                      }
                      className="mt-1 h-8 print:border-none print:bg-transparent print:text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-sm print:text-xs">
                      *Cihazın Modeli:
                    </Label>
                    <Input
                      value={formData.deviceModel}
                      onChange={(e) =>
                        handleInputChange("deviceModel", e.target.value)
                      }
                      className="mt-1 h-8 print:border-none print:bg-transparent print:text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-sm print:text-xs">
                      *Problem Tanımı:
                    </Label>
                    <Textarea
                      value={formData.problemDescription}
                      onChange={(e) =>
                        handleInputChange("problemDescription", e.target.value)
                      }
                      className="mt-1 h-16 print:border-none print:bg-transparent print:text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Request */}
          <div className="border-b-2 border-black">
            <div className="flex">
              <div className="w-1/2 border-r-2 border-black p-3 print:p-1">
                <h2 className="font-bold text-center mb-3 bg-gray-200 py-1 text-sm print:text-xs">
                  SERVİS/BAKIM/ARIZA HİZMET TALEBİ
                </h2>

                <div className="mb-3">
                  <p className="text-sm mb-2 print:text-xs">
                    İşletim sisteminin tekrar yüklenmesi
                  </p>
                  <p className="text-xs text-gray-600 mb-3 print:text-xs">
                    (Talep edilen yazılımları belirtiniz)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-sm mb-2 print:text-xs">
                      Standart Uygulamalar
                    </h3>
                    <div className="grid grid-cols-2 gap-1">
                      {predefinedApplications.map((app) => (
                        <div
                          key={app.key}
                          className="flex items-center space-x-1"
                        >
                          <Checkbox
                            id={app.key}
                            checked={formData.applications[app.key] || false}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(app.key, checked)
                            }
                          />
                          <Label
                            htmlFor={app.key}
                            className="text-xs print:text-xs leading-tight"
                          >
                            {app.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Applications - Sol tarafta */}
                  <div>
                    <h3 className="font-bold text-sm mb-2 print:text-xs">
                      Ek Uygulamalar
                    </h3>
                    <div className="space-y-2">
                      {customApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`custom-${app.id}`}
                            checked={app.checked}
                            onCheckedChange={(checked) =>
                              handleCustomApplicationChange(
                                app.id,
                                "checked",
                                checked
                              )
                            }
                          />
                          <Input
                            value={app.name}
                            onChange={(e) =>
                              handleCustomApplicationChange(
                                app.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Uygulama adı"
                            className="flex-1 h-6 text-xs print:border-none print:bg-transparent print:text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomApplication(app.id)}
                            className="h-6 w-6 p-0 print:hidden"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomApplication}
                        className="mt-2 h-6 text-xs print:hidden"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Uygulama Ekle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-3 print:p-1">
                <h2 className="font-bold text-center mb-3 bg-gray-200 py-1 text-sm print:text-xs">
                  SERVİS HİZMETİ AÇIKLAMASI
                </h2>
                <Textarea
                  value={formData.serviceDescription}
                  onChange={(e) =>
                    handleInputChange("serviceDescription", e.target.value)
                  }
                  className="w-full h-32 print:border-none print:bg-transparent print:text-xs"
                  placeholder="Servis açıklaması..."
                />

                <div className="mt-6">
                  <h3 className="font-bold text-center mb-3 bg-gray-200 py-1 text-sm print:text-xs">
                    TALEP EDİLEN DİĞER KONULAR
                  </h3>
                  <Textarea
                    value={formData.otherRequests}
                    onChange={(e) =>
                      handleInputChange("otherRequests", e.target.value)
                    }
                    className="w-full h-24 print:border-none print:bg-transparent print:text-xs"
                    placeholder="Diğer talepler..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warning and Service Request Notice */}
          <div className="border-b-2 border-black p-4 print:p-2">
            <div className="flex items-start space-x-2 mb-4">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center">
                <span className="text-sm font-bold">!</span>
              </div>
              <div className="text-xs">
                <p className="mb-1">
                  1-) Teknik Servise bırakılan bilgisayarlarda oluşacak veri
                  kaybından kesinlikle Bilgi İşlem Müdürlüğü sorumlu tutulmaz.
                </p>
                <p>
                  2-) Tüm yedekleme faaliyetleri formda belirtilmemiş işe
                  kullanıcının kendisine aittir.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded">
              <h3 className="font-bold mb-2">Servis Talep Eden:</h3>
              <p className="text-sm">
                Genel Şartlar ve Cihaz Tamir Sözleşmesi olarak yukarıda
                belirtilen 2 maddelik dokümanı okudum. Bu şartları kabul ederek,
                Bilgi İşlem Müdürlüğünden teknik servis talep ediyorum.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex">
            <div className="w-1/2 border-r-2 border-black p-4 print:p-2">
              <h3 className="font-bold text-center mb-4 bg-gray-200 py-2">
                SERVİSE TESLİM EDEN
              </h3>
              <div className="h-20 border-b border-gray-300 mb-2"></div>
              <div className="text-center">
                <Input
                  value={formData.handedOverBy}
                  onChange={(e) =>
                    handleInputChange("handedOverBy", e.target.value)
                  }
                  placeholder="Ad Soyad"
                  className="text-center print:border-none print:bg-transparent"
                />
              </div>
            </div>
            <div className="w-1/2 p-4 print:p-2">
              <h3 className="font-bold text-center mb-4 bg-gray-200 py-2">
                SERVİSE TESLİM ALAN
              </h3>
              <div className="h-20 border-b border-gray-300 mb-2"></div>
              <div className="text-center">
                <Input
                  value={formData.receivedBy}
                  onChange={(e) =>
                    handleInputChange("receivedBy", e.target.value)
                  }
                  placeholder="Ad Soyad"
                  className="text-center print:border-none print:bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black p-2 print:p-1">
            <div className="text-xs text-center">
              <p>
                Doküman No:FR-Bİ-7.5-02/ Yayın Tarihi: 29.06.2010 Revz. No:01 /
                Revz. Tarihi: 05.05.2022
              </p>
              <p>Fatih Sultan Mehmet Mah. Kent Meydanı No:2 Kartepe/KOCAELİ</p>
              <p>Ayrıntılı Bilgi İçin İrtibat: Kerim KANDAZ</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6 print:hidden">
          <Button onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Yazdır</span>
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={isGeneratingPDF}
          >
            <Download className="h-4 w-4" />
            <span>
              {isGeneratingPDF ? "PDF Oluşturuluyor..." : "PDF İndir"}
            </span>
          </Button>
          <Button
            onClick={saveForm}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Kaydet</span>
          </Button>
          <Button
            onClick={clearCurrentForm}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <span>Temizle</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
