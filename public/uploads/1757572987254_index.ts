import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generatePdfFromData = async ({ rfq }: { rfq: any }) => {
  const page1 = document.createElement("div");
  const page2 = document.createElement("div");
  [page1, page2].forEach((page) => {
    page.style.width = "1000px";
    page.style.padding = "4px";
    page.style.backgroundColor = "white";
    page.style.position = "fixed";
    page.style.left = "-10000px";
  });

  page1.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid italic">
        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${rfq.techpack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <!-- Product Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Product Details</p>
            </div>
            <div class="border border-t-0 divide-y divide-blue-200">
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Description</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.productOverview || "No description provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Notes</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.productionNotes || "No notes provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Category</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.category_Subcategory || "Not specified"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Intended Market Age Range</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.intendedMarket_AgeRange || "Not specified"}</p>
                </div>
            </div>
        </div>


        <!-- BOM -->
        <div class="mb-6">
             <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Bill of Materials (BOM)</p>
            </div>
            <div class="border border-t-0 overflow-x-auto">
                ${
                  rfq.techpack.tech_pack.materials && rfq.techpack.tech_pack.materials.length > 0
                    ? `
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="text-left py-2 px-4 font-semibold">Component Name</th>
                            <th class="text-left py-2 px-4 font-semibold">Material</th>
                            <th class="text-left py-2 px-4 font-semibold">Specification</th>
                            <th class="text-left py-2 px-4 font-semibold">Qty per unit</th>
                            <th class="text-left py-2 px-4 font-semibold">Unit Cost</th>
                            <th class="text-left py-2 px-4 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rfq.techpack.tech_pack.materials
                          .map(
                            (material: any) => `
                        <tr class="border-b">
                            <td class="py-2 px-4">${material.component || ""}</td>
                            <td class="py-2 px-4">${material.material || ""}</td>
                            <td class="py-2 px-4">${material.specification || ""}</td>
                            <td class="py-2 px-4">${material.quantityPerUnit || ""}</td>
                            <td class="py-2 px-4">${material.unitCost || ""}</td>
                            <td class="py-2 px-4">${material.notes || ""}</td>
                        </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                `
                    : `<p class="text-gray-500 p-4">No materials specified</p>`
                }
            </div>
        </div>

        <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- Measurements & Tolerance -->
                <div>
                     <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Measurements & Tolerance</p>
            </div>
                    <div class="border border-t-0 p-4 overflow-x-auto">
                        ${
                          rfq.techpack.tech_pack.dimensions &&
                          Array.isArray(rfq.techpack.tech_pack.dimensions.details) &&
                          rfq.techpack.tech_pack.dimensions.details.length > 0
                            ? `
                        <table class="w-full border border-collapse text-sm">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="border px-4 py-2 text-left font-semibold">Measurement</th>
                                    <th class="border px-4 py-2 text-left font-semibold">Value</th>
                                    <th class="border px-4 py-2 text-left font-semibold">Tolerance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rfq.techpack.tech_pack.dimensions.details
                                  .map((detail: any) =>
                                    Object.entries(detail)
                                      .map(([key, val]: [string, any]) => {
                                        const value = val?.value || "-";
                                        const tolerance = val?.tolerance || "-";
                                        return `
                                <tr>
                                    <td class="border px-4 py-2 capitalize">${key}</td>
                                    <td class="border px-4 py-2">${value}</td>
                                    <td class="border px-4 py-2">${tolerance}</td>
                                </tr>
                                `;
                                      })
                                      .join("")
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                        `
                            : `<p class="text-gray-500 italic">No measurements provided.</p>`
                        }
                    </div>
                </div>

                <!-- Colorways -->
                <div>
                    <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                        <p class="text-2xl font-bold  pl-4 pb-2">Colorways</p>
                    </div>
                    <div class="border border-t-0 p-4 space-y-4 bg-gray-50">

                        <!-- Primary Colors -->
                        ${
                          rfq.techpack.tech_pack.colors.primaryColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 italic">Primary Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${rfq.techpack.tech_pack.colors.primaryColors
                                  .map(
                                    (color: any) => `
                                <div class="flex items-center">
                                    <span class="w-5 h-5 rounded-full mr-2 border"
                                        style="background-color:${color.hex};"></span>
                                    <span>${color.name} <span class="text-xs text-gray-500">(${color.hex})</span></span>
                                </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>`
                            : `<p class="text-gray-500 text-sm italic">No primary colors specified</p>`
                        }

                        <!-- Accent Colors -->
                        ${
                          rfq.techpack.tech_pack.colors.accentColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 italic">Accent Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${rfq.techpack.tech_pack.colors.accentColors
                                  .map(
                                    (color: any) => `
                                <div class="flex items-center">
                                    <span class="w-5 h-5 rounded-full mr-2 border"
                                        style="background-color:${color.hex};"></span>
                                    <span>${color.name} <span class="text-xs text-gray-500">(${color.hex})</span></span>
                                </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>`
                            : `<p class="text-gray-500 text-sm italic">No accent colors specified</p>`
                        }

                    </div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4">
                ${
                  rfq.techpack.tech_pack.qualityStandards
                    ? `
                <p class="text-gray-700">${rfq.techpack.tech_pack.qualityStandards}</p>
                `
                    : `<p class="text-gray-700">No Quality Standards information provided</p>`
                }
            </div>
        </div>
    </div>
</div>
`;

  page2.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid italic">

        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${rfq.techpack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Packaging</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <ul class="list-disc pl-6 space-y-1">
                    <li><strong>Packaging Type:</strong> ${
                      rfq.techpack.tech_pack.packaging?.packagingDetails?.packagingType || ""
                    }</li>
                    <li><strong>Material Spec:</strong>
                        ${rfq.techpack.tech_pack.packaging?.packagingDetails?.materialSpec || ""}</li>
                    <li><strong>Closure Type:</strong> ${
                      rfq.techpack.tech_pack.packaging?.packagingDetails?.closureType || ""
                    }
                    </li>
                    <li><strong>Artwork File Reference:</strong>
                        ${rfq.techpack.tech_pack.packaging?.packagingDetails?.artworkFileReference || ""}</li>
                    <li><strong>Inner Packaging:</strong> ${
                      rfq.techpack.tech_pack.packaging?.packagingDetails?.innerPackaging || ""
                    }</li>
                    <li><strong>Barcode & Label Placement:</strong>
                        ${rfq.techpack.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || ""}</li>
                </ul>
            </div>
        </div>

        <!-- Sizes Section -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Sizes</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${rfq.techpack.tech_pack.sizeRange?.gradingLogic || ""}
                <div class="mt-2 font-semibold">
                    ${rfq.techpack.tech_pack.sizeRange?.sizes?.join(", ") || ""}
                </div>
            </div>
        </div>

        <!-- Construction Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Construction Details</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <p class="mb-2 text-gray-700">
                    ${rfq.techpack.tech_pack.constructionDetails?.description || ""}
                </p>
                ${
                  rfq.techpack.tech_pack.constructionDetails.constructionFeatures?.length > 0
                    ? `
                <ul class="list-disc pl-6 space-y-1">
                    ${rfq.techpack.tech_pack.constructionDetails.constructionFeatures
                      .map(
                        (item: any) => `
                    <li>
                        <p class="text-sm text-gray-600"><strong>${item.featureName || "Not specified"}</strong>: ${
                          item.details || "Not specified"
                        }</p>
                    </li>
                    `
                      )
                      .join("")}
                </ul>
                `
                    : ""
                }
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${rfq.techpack.tech_pack.qualityStandards || ""}
            </div>
        </div>

        <!-- Product Photos -->
        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold pl-4 pb-2">Product Photos</p>
            </div>
            <div class="border border-t-0 p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <!-- Front -->
                    <div
                        class="border rounded-2xl overflow-hidden flex items-center justify-center bg-orange-300 aspect-[2/3]">
                        ${
                          rfq.techpack.image_data?.front?.url
                            ? `<img src="${rfq.techpack.image_data.front.url}" alt="Front view"
                            class="w-full h-full object-contain">`
                            : `<span class="text-white font-bold text-lg">Front</span>`
                        }
                    </div>

                    <!-- Back -->
                    <div
                        class="border rounded-2xl overflow-hidden flex items-center justify-center bg-orange-300 aspect-[2/3]">
                        ${
                          rfq.techpack.image_data?.back?.url
                            ? `<img src="${rfq.techpack.image_data.back.url}" alt="Back view" class="w-full h-full object-contain">`
                            : `<span class="text-white font-bold text-lg">Back</span>`
                        }
                    </div>

                    <!-- Side -->
                    <div
                        class="border rounded-2xl overflow-hidden flex items-center justify-center bg-orange-300 aspect-[2/3]">
                        ${
                          rfq.techpack.image_data?.side?.url
                            ? `<img src="${rfq.techpack.image_data.side.url}" alt="Side view" class="w-full h-full object-contain">`
                            : `<span class="text-white font-bold text-lg">Side</span>`
                        }
                    </div>

                </div>
            </div>
        </div>


    </div>
</div>
  `;

  document.body.appendChild(page1);
  document.body.appendChild(page2);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const options = {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    };
    const pages = [page1, page2];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], options);
      const imgData = canvas.toDataURL("image/jpeg", 1);

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", 10, 10, 190, 0, undefined, "FAST");
    }

    pdf.save(rfq.rfq.product_idea + ".pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    [page1, page2].forEach((page) => {
      if (page.parentNode) {
        document.body.removeChild(page);
      }
    });
  }
};

export const generatePdffromTechpack = async ({ rfq }: { rfq: any }) => {
  console.log("rfq ==> ", rfq);
  const page1 = document.createElement("div");
  const page2 = document.createElement("div");
  [page1, page2].forEach((page) => {
    page.style.width = "1000px";
    page.style.padding = "4px";
    page.style.backgroundColor = "white";
    page.style.position = "fixed";
    page.style.left = "-10000px";
  });

  page1.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid italic">
        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${rfq.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <!-- Product Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Product Details</p>
            </div>
            <div class="border border-t-0 divide-y divide-blue-200">
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Description</p>
                    <p class="text-gray-700">${rfq.tech_pack.productOverview || "No description provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Notes</p>
                    <p class="text-gray-700">${rfq.tech_pack.productionNotes || "No notes provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Category</p>
                    <p class="text-gray-700">${rfq.tech_pack.category_Subcategory || "Not specified"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Intended Market Age Range</p>
                    <p class="text-gray-700">${rfq.tech_pack.intendedMarket_AgeRange || "Not specified"}</p>
                </div>
            </div>
        </div>


        <!-- BOM -->
        <div class="mb-6">
             <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Bill of Materials (BOM)</p>
            </div>
            <div class="border border-t-0 overflow-x-auto">
                ${
                  rfq.tech_pack.materials && rfq.tech_pack.materials.length > 0
                    ? `
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="text-left py-2 px-4 font-semibold">Component Name</th>
                            <th class="text-left py-2 px-4 font-semibold">Material</th>
                            <th class="text-left py-2 px-4 font-semibold">Specification</th>
                            <th class="text-left py-2 px-4 font-semibold">Qty per unit</th>
                            <th class="text-left py-2 px-4 font-semibold">Unit Cost</th>
                            <th class="text-left py-2 px-4 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rfq.tech_pack.materials
                          .map(
                            (material: any) => `
                        <tr class="border-b">
                            <td class="py-2 px-4">${material.component || ""}</td>
                            <td class="py-2 px-4">${material.material || ""}</td>
                            <td class="py-2 px-4">${material.specification || ""}</td>
                            <td class="py-2 px-4">${material.quantityPerUnit || ""}</td>
                            <td class="py-2 px-4">${material.unitCost || ""}</td>
                            <td class="py-2 px-4">${material.notes || ""}</td>
                        </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                `
                    : `<p class="text-gray-500 p-4">No materials specified</p>`
                }
            </div>
        </div>

        <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- Measurements & Tolerance -->
                <div>
                     <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Measurements & Tolerance</p>
            </div>
                    <div class="border border-t-0 p-4 overflow-x-auto">
                        ${
                          rfq.tech_pack.dimensions &&
                          Array.isArray(rfq.tech_pack.dimensions.details) &&
                          rfq.tech_pack.dimensions.details.length > 0
                            ? `
                        <table class="w-full border border-collapse text-sm">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="border px-4 py-2 text-left font-semibold">Measurement</th>
                                    <th class="border px-4 py-2 text-left font-semibold">Value</th>
                                    <th class="border px-4 py-2 text-left font-semibold">Tolerance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rfq.tech_pack.dimensions.details
                                  .map((detail: any) =>
                                    Object.entries(detail)
                                      .map(([key, val]: [string, any]) => {
                                        const value = val?.value || "-";
                                        const tolerance = val?.tolerance || "-";
                                        return `
                                <tr>
                                    <td class="border px-4 py-2 capitalize">${key}</td>
                                    <td class="border px-4 py-2">${value}</td>
                                    <td class="border px-4 py-2">${tolerance}</td>
                                </tr>
                                `;
                                      })
                                      .join("")
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                        `
                            : `<p class="text-gray-500 italic">No measurements provided.</p>`
                        }
                    </div>
                </div>

                <!-- Colorways -->
                <div>
                    <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                        <p class="text-2xl font-bold  pl-4 pb-2">Colorways</p>
                    </div>
                    <div class="border border-t-0 p-4 space-y-4 bg-gray-50">

                        <!-- Primary Colors -->
                        ${
                          rfq.tech_pack.colors.primaryColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 italic">Primary Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${rfq.tech_pack.colors.primaryColors
                                  .map(
                                    (color: any) => `
                                <div class="flex items-center">
                                    <span class="w-5 h-5 rounded-full mr-2 border"
                                        style="background-color:${color.hex};"></span>
                                    <span>${color.name} <span class="text-xs text-gray-500">(${color.hex})</span></span>
                                </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>`
                            : `<p class="text-gray-500 text-sm italic">No primary colors specified</p>`
                        }

                        <!-- Accent Colors -->
                        ${
                          rfq.tech_pack.colors.accentColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 italic">Accent Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${rfq.tech_pack.colors.accentColors
                                  .map(
                                    (color: any) => `
                                <div class="flex items-center">
                                    <span class="w-5 h-5 rounded-full mr-2 border"
                                        style="background-color:${color.hex};"></span>
                                    <span>${color.name} <span class="text-xs text-gray-500">(${color.hex})</span></span>
                                </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>`
                            : `<p class="text-gray-500 text-sm italic">No accent colors specified</p>`
                        }

                    </div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4">
                ${
                  rfq.tech_pack.qualityStandards
                    ? `
                <p class="text-gray-700">${rfq.tech_pack.qualityStandards}</p>
                `
                    : `<p class="text-gray-700">No Quality Standards information provided</p>`
                }
            </div>
        </div>
    </div>
</div>
`;

  page2.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid italic">

        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${rfq.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Packaging</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <ul class="list-disc pl-6 space-y-1">
                    <li><strong>Packaging Type:</strong> ${
                      rfq.tech_pack.packaging?.packagingDetails?.packagingType || ""
                    }</li>
                    <li><strong>Material Spec:</strong>
                        ${rfq.tech_pack.packaging?.packagingDetails?.materialSpec || ""}</li>
                    <li><strong>Closure Type:</strong> ${rfq.tech_pack.packaging?.packagingDetails?.closureType || ""}
                    </li>
                    <li><strong>Artwork File Reference:</strong>
                        ${rfq.tech_pack.packaging?.packagingDetails?.artworkFileReference || ""}</li>
                    <li><strong>Inner Packaging:</strong> ${
                      rfq.tech_pack.packaging?.packagingDetails?.innerPackaging || ""
                    }</li>
                    <li><strong>Barcode & Label Placement:</strong>
                        ${rfq.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || ""}</li>
                </ul>
            </div>
        </div>

        <!-- Sizes Section -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Sizes</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${rfq.tech_pack.sizeRange?.gradingLogic || ""}
                <div class="mt-2 font-semibold">
                    ${rfq.tech_pack.sizeRange?.sizes?.join(", ") || ""}
                </div>
            </div>
        </div>

        <!-- Construction Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Construction Details</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <p class="mb-2 text-gray-700">
                    ${rfq.tech_pack.constructionDetails?.description || ""}
                </p>
                ${
                  rfq.tech_pack.constructionDetails.constructionFeatures?.length > 0
                    ? `
                <ul class="list-disc pl-6 space-y-1">
                    ${rfq.tech_pack.constructionDetails.constructionFeatures
                      .map(
                        (item: any) => `
                    <li>
                        <p class="text-sm text-gray-600"><strong>${item.featureName || "Not specified"}</strong>: ${
                          item.details || "Not specified"
                        }</p>
                    </li>
                    `
                      )
                      .join("")}
                </ul>
                `
                    : ""
                }
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${rfq.tech_pack.qualityStandards || ""}
            </div>
        </div>

        <!-- Product Photos -->
        <div class="mb-4">
  <div class="flex justify-start items-center bg-[#001F54] text-white italic">
    <p class="text-2xl font-bold pl-4 pb-2">Product Photos</p>
  </div>
  <div class="border border-t-0 p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Front -->
      <div class="border rounded-2xl overflow-hidden flex items-center justify-center  aspect-[2/3]">
        ${
          rfq.image_data?.front?.url
            ? `<img src="${rfq.image_data.front.url}" alt="Front view"
                class="w-full h-auto object-contain">`
            : `<span class="text-white font-bold text-lg">Front</span>`
        }
      </div>

      <!-- Back -->
      <div class="border rounded-2xl overflow-hidden flex items-center justify-center  aspect-[2/3]">
        ${
          rfq.image_data?.back?.url
            ? `<img src="${rfq.image_data.back.url}" alt="Back view"
                class="w-full h-auto object-contain">`
            : `<span class="text-white font-bold text-lg">Back</span>`
        }
      </div>

      <!-- Side -->
      <div class="border rounded-2xl overflow-hidden flex items-center justify-center  aspect-[2/3]">
        ${
          rfq.image_data?.side?.url
            ? `<img src="${rfq.image_data.side.url}" alt="Side view"
                class="w-full h-auto object-contain">`
            : `<span class="text-white font-bold text-lg">Side</span>`
        }
      </div>

    </div>
  </div>
</div>


    </div>
</div>
  `;

  document.body.appendChild(page1);
  document.body.appendChild(page2);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const options = {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    };
    const pages = [page1, page2];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], options);
      const imgData = canvas.toDataURL("image/jpeg", 1);

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", 10, 10, 190, 0, undefined, "FAST");
    }

    pdf.save(rfq.tech_pack.productName + ".pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    [page1, page2].forEach((page) => {
      if (page.parentNode) {
        document.body.removeChild(page);
      }
    });
  }
};

export const generatePdfBase64 = async (techPack: any) => {
  const page1 = document.createElement("div");
  const page2 = document.createElement("div");

  [page1, page2].forEach((page) => {
    page.style.width = "1000px";
    page.style.padding = "4px";
    page.style.backgroundColor = "white";
    page.style.position = "fixed";
    page.style.left = "-10000px";
  });

  page1.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid italic">
        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${techPack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <!-- Product Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Product Details</p>
            </div>
            <div class="border border-t-0 divide-y divide-blue-200">
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Description</p>
                    <p class="text-gray-700">${techPack.tech_pack.productOverview || "No description provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Notes</p>
                    <p class="text-gray-700">${techPack.tech_pack.productionNotes || "No notes provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Product Category</p>
                    <p class="text-gray-700">${techPack.tech_pack.category_Subcategory || "Not specified"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold italic text-sm text-gray-800">Intended Market Age Range</p>
                    <p class="text-gray-700">${techPack.tech_pack.intendedMarket_AgeRange || "Not specified"}</p>
                </div>
            </div>
        </div>


        <!-- BOM -->
        <div class="mb-6">
             <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Bill of Materials (BOM)</p>
            </div>
            <div class="border border-t-0 overflow-x-auto">
                ${
                  techPack.tech_pack.materials && techPack.tech_pack.materials.length > 0
                    ? `
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="text-left py-2 px-4 font-semibold">Component Name</th>
                            <th class="text-left py-2 px-4 font-semibold">Material</th>
                            <th class="text-left py-2 px-4 font-semibold">Specification</th>
                            <th class="text-left py-2 px-4 font-semibold">Qty per unit</th>
                            <th class="text-left py-2 px-4 font-semibold">Unit Cost</th>
                            <th class="text-left py-2 px-4 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${techPack.tech_pack.materials
                          .map(
                            (material: any) => `
                        <tr class="border-b">
                            <td class="py-2 px-4">${material.component || ""}</td>
                            <td class="py-2 px-4">${material.material || ""}</td>
                            <td class="py-2 px-4">${material.specification || ""}</td>
                            <td class="py-2 px-4">${material.quantityPerUnit || ""}</td>
                            <td class="py-2 px-4">${material.unitCost || ""}</td>
                            <td class="py-2 px-4">${material.notes || ""}</td>
                        </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                `
                    : `<p class="text-gray-500 p-4">No materials specified</p>`
                }
            </div>
        </div>

        <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- Measurements & Tolerance -->
                <div>
                     <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Measurements & Tolerance</p>
            </div>
                    <div class="border border-t-0 p-4 overflow-x-auto">
                        ${
                          techPack.tech_pack.dimensions &&
                          Array.isArray(techPack.tech_pack.dimensions.details) &&
                          techPack.tech_pack.dimensions.details.length > 0
                            ? `
                        <table class="w-full border border-collapse text-sm">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="border px-4 py-2 text-left font-semibold">Measurement</th>
                                    <th class="border px-4 py-2 text-left font-semibold">Value</th>
                                    <th class="border px-4 py-2 text-left font-semibold">Tolerance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${techPack.tech_pack.dimensions.details
                                  .map((detail: any) =>
                                    Object.entries(detail)
                                      .map(([key, val]: [string, any]) => {
                                        const value = val?.value || "-";
                                        const tolerance = val?.tolerance || "-";
                                        return `
                                <tr>
                                    <td class="border px-4 py-2 capitalize">${key}</td>
                                    <td class="border px-4 py-2">${value}</td>
                                    <td class="border px-4 py-2">${tolerance}</td>
                                </tr>
                                `;
                                      })
                                      .join("")
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                        `
                            : `<p class="text-gray-500 italic">No measurements provided.</p>`
                        }
                    </div>
                </div>

                <!-- Colorways -->
                <div>
                    <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                        <p class="text-2xl font-bold  pl-4 pb-2">Colorways</p>
                    </div>
                    <div class="border border-t-0 p-4 space-y-4 bg-gray-50">

                        <!-- Primary Colors -->
                        ${
                          techPack.tech_pack.colors.primaryColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 italic">Primary Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${techPack.tech_pack.colors.primaryColors
                                  .map(
                                    (color: any) => `
                                <div class="flex items-center">
                                    <span class="w-5 h-5 rounded-full mr-2 border"
                                        style="background-color:${color.hex};"></span>
                                    <span>${color.name} <span class="text-xs text-gray-500">(${color.hex})</span></span>
                                </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>`
                            : `<p class="text-gray-500 text-sm italic">No primary colors specified</p>`
                        }

                        <!-- Accent Colors -->
                        ${
                          techPack.tech_pack.colors.accentColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 italic">Accent Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${techPack.tech_pack.colors.accentColors
                                  .map(
                                    (color: any) => `
                                <div class="flex items-center">
                                    <span class="w-5 h-5 rounded-full mr-2 border"
                                        style="background-color:${color.hex};"></span>
                                    <span>${color.name} <span class="text-xs text-gray-500">(${color.hex})</span></span>
                                </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>`
                            : `<p class="text-gray-500 text-sm italic">No accent colors specified</p>`
                        }

                    </div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4">
                ${
                  techPack.tech_pack.qualityStandards
                    ? `
                <p class="text-gray-700">${techPack.tech_pack.qualityStandards}</p>
                `
                    : `<p class="text-gray-700">No Quality Standards information provided</p>`
                }
            </div>
        </div>
    </div>
</div>
`;

  page2.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid italic">

        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${techPack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Packaging</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <ul class="list-disc pl-6 space-y-1">
                    <li><strong>Packaging Type:</strong> ${
                      techPack.tech_pack.packaging?.packagingDetails?.packagingType || ""
                    }</li>
                    <li><strong>Material Spec:</strong>
                        ${techPack.tech_pack.packaging?.packagingDetails?.materialSpec || ""}</li>
                    <li><strong>Closure Type:</strong> ${
                      techPack.tech_pack.packaging?.packagingDetails?.closureType || ""
                    }
                    </li>
                    <li><strong>Artwork File Reference:</strong>
                        ${techPack.tech_pack.packaging?.packagingDetails?.artworkFileReference || ""}</li>
                    <li><strong>Inner Packaging:</strong> ${
                      techPack.tech_pack.packaging?.packagingDetails?.innerPackaging || ""
                    }</li>
                    <li><strong>Barcode & Label Placement:</strong>
                        ${techPack.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || ""}</li>
                </ul>
            </div>
        </div>

        <!-- Sizes Section -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Sizes</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${techPack.tech_pack.sizeRange?.gradingLogic || ""}
                <div class="mt-2 font-semibold">
                    ${techPack.tech_pack.sizeRange?.sizes?.join(", ") || ""}
                </div>
            </div>
        </div>

        <!-- Construction Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Construction Details</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <p class="mb-2 text-gray-700">
                    ${techPack.tech_pack.constructionDetails?.description || ""}
                </p>
                ${
                  techPack.tech_pack.constructionDetails.constructionFeatures?.length > 0
                    ? `
                <ul class="list-disc pl-6 space-y-1">
                    ${techPack.tech_pack.constructionDetails.constructionFeatures
                      .map(
                        (item: any) => `
                    <li>
                        <p class="text-sm text-gray-600"><strong>${item.featureName || "Not specified"}</strong>: ${
                          item.details || "Not specified"
                        }</p>
                    </li>
                    `
                      )
                      .join("")}
                </ul>
                `
                    : ""
                }
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${techPack.tech_pack.qualityStandards || ""}
            </div>
        </div>

        <!-- Product Photos -->
        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white italic">
                <p class="text-2xl font-bold pl-4 pb-2">Product Photos</p>
            </div>
            <div class="border border-t-0 p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <!-- Front -->
                    <div
                        class="border rounded-2xl overflow-hidden flex items-center justify-center bg-orange-300 aspect-[2/3]">
                        ${
                          techPack.image_data?.front?.url
                            ? `<img src="${techPack.image_data.front.url}" alt="Front view"
                            class="w-full h-full object-contain">`
                            : `<span class="text-white font-bold text-lg">Front</span>`
                        }
                    </div>

                    <!-- Back -->
                    <div
                        class="border rounded-2xl overflow-hidden flex items-center justify-center bg-orange-300 aspect-[2/3]">
                        ${
                          techPack.image_data?.back?.url
                            ? `<img src="${techPack.image_data.back.url}" alt="Back view" class="w-full h-full object-contain">`
                            : `<span class="text-white font-bold text-lg">Back</span>`
                        }
                    </div>

                    <!-- Side -->
                    <div
                        class="border rounded-2xl overflow-hidden flex items-center justify-center bg-orange-300 aspect-[2/3]">
                        ${
                          techPack.image_data?.side?.url
                            ? `<img src="${techPack.image_data.side.url}" alt="Side view" class="w-full h-full object-contain">`
                            : `<span class="text-white font-bold text-lg">Side</span>`
                        }
                    </div>

                </div>
            </div>
        </div>


    </div>
</div>
  `;

  document.body.appendChild(page1);
  document.body.appendChild(page2);

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const options = {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      dpi: 300,
    };

    const pages = [page1, page2];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], options);
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    }

    // Create base64 from Blob
    const pdfBlob = pdf.output("blob");
    const buffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    let binaryString = "";
    const chunkSize = 8192;

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, [...chunk]);
    }

    const base64 = btoa(binaryString);
    return base64;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    // Clean up DOM
    [page1, page2].forEach((page) => {
      if (page.parentNode) document.body.removeChild(page);
    });
  }
};
