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
    <div class="border-2 border-[#001F54] border-solid ">
        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${rfq.techpack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <!-- Product Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Product Details</p>
            </div>
            <div class="border border-t-0 divide-y divide-blue-200">
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Product Description</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.productOverview || "No description provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Product Notes</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.productionNotes || "No notes provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Product Category</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.category_Subcategory || "Not specified"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Intended Market Age Range</p>
                    <p class="text-gray-700">${rfq.techpack.tech_pack.intendedMarket_AgeRange || "Not specified"}</p>
                </div>
            </div>
        </div>


        <!-- BOM -->
        <div class="mb-6">
             <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Bill of Materials (BOM)</p>
            </div>
            <div class="border border-t-0 overflow-x-auto">
                ${
                  rfq.techpack.tech_pack.materials && rfq.techpack.tech_pack.materials.length > 0
                    ? `
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class=" py-2 px-4 font-semibold">Component Name</th>
                            <th class=" py-2 px-4 font-semibold">Material</th>
                            <th class=" py-2 px-4 font-semibold">Specification</th>
                            <th class=" py-2 px-4 font-semibold">Qty per unit</th>
                            <th class=" py-2 px-4 font-semibold">Unit Cost</th>
                            <th class=" py-2 px-4 font-semibold">Notes</th>
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
                     <div class="flex justify-start items-center bg-[#001F54] text-white ">
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
                            : `<p class="text-gray-500 ">No measurements provided.</p>`
                        }
                    </div>
                </div>

                <!-- Colorways -->
                <div>
                    <div class="flex justify-start items-center bg-[#001F54] text-white ">
                        <p class="text-2xl font-bold  pl-4 pb-2">Colorways</p>
                    </div>
                    <div class="border border-t-0 p-4 space-y-4 bg-gray-50">

                        <!-- Primary Colors -->
                        ${
                          rfq.techpack.tech_pack.colors.primaryColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 ">Primary Colors</h3>
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
                            : `<p class="text-gray-500 text-sm ">No primary colors specified</p>`
                        }

                        <!-- Accent Colors -->
                        ${
                          rfq.techpack.tech_pack.colors.accentColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 ">Accent Colors</h3>
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
                            : `<p class="text-gray-500 text-sm ">No accent colors specified</p>`
                        }

                    </div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
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
    <div class="border-2 border-[#001F54] border-solid ">

        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${rfq.techpack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
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
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
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
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
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
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${rfq.techpack.tech_pack.qualityStandards || ""}
            </div>
        </div>

        <!-- Product Photos -->
        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
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

export const generatePdffromTechpack = async ({ tech_pack }: { tech_pack: any }) => {
  const page1 = document.createElement("div");
  const page2 = document.createElement("div");
  const page3 = document.createElement("div");

  // Basic styles for PDF pages
  [page1, page2, page3].forEach((page) => {
    page.style.width = "890px";
    page.style.padding = "20px";
    page.style.backgroundColor = "white";
    page.style.position = "fixed";
    page.style.left = "-10000px";
  });

  //   page1.innerHTML = `
  //    <div class="max-w-6xl mx-auto bg-white p-6 shadow-lg border border-[#001F54]">
  //         <header class="grid grid-cols-3 gap-1 pb-3 mb-6 text-xs font-semibold uppercase">
  //             <div class="border border-[#001F54] p-2">BRAND: <span class="font-normal normal-case">THE BRAND NAME</span>
  //             </div>
  //             <div class="border border-[#001F54] p-2">DESIGNER: <span class="font-normal normal-case">CLIENT NAME
  //                     HERE</span></div>
  //             <div class="border border-[#001F54] p-2">DESCRIPTION: <span class="font-normal normal-case">WOMENS
  //                     JACKET</span></div>
  //             <div class="border border-[#001F54] p-2">DATE: 12/10/25</div>
  //             <div class="border border-[#001F54] p-2">SIZE RANGE & [SAMPLE SIZE]: <span class="font-normal normal-case">CLIENT NAME
  //                     HERE</span></div>
  //             <div class="border border-[#001F54] p-2">SIZE RANGE & [SAMPLE SIZE]:<span class="font-normal normal-case">CLIENT NAME
  //                     HERE</span></div>
  //             <div class="border border-[#001F54] p-2">SIZE RANGE & [SAMPLE SIZE]: <span class="font-normal normal-case">CLIENT NAME
  //                     HERE</span></div>
  //             <div class="border border-[#001F54] p-2">SIZE RANGE & [SAMPLE SIZE]: <span class="font-normal normal-case">CLIENT NAME
  //                     HERE</span></div>
  //             <div class="border border-[#001F54] p-2">SIZE RANGE & [SAMPLE SIZE]: <span class="font-normal normal-case">CLIENT NAME
  //                     HERE</span></div>
  //         </header>

  //         <section class="grid grid-cols-10 mb-6 border-2 border-[#001F54]">
  //             <div class="col-span-3  border-r-2 border-[#001F54]">
  //                 <h3 class="font-semibold mb-2 text-xs uppercase border-[#001F54] border-b-2 tracking-wide p-2">FABRIC
  //                     SWATCH</h3>
  //                 <div class="flex justify-center">
  //                     <div class="border shadow-lg w-full">
  //                         <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s"
  //                             alt="Fabric Swatch" class=" object-cover w-full">
  //                     </div>
  //                 </div>
  //             </div>
  //             <div class="col-span-7">
  //                 <h3 class="font-semibold mb-2 text-xs uppercase tracking-wide border-[#001F54] border-b-2 p-2">SKETCH
  //                 </h3>
  //                 <div class="flex space-x-6 justify-center">
  //                     <div class=" p-2 shadow w-full">
  //                         <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s"
  //                             alt="Jacket Front" class=" object-contain w-full">
  //                     </div>
  //                     <div class=" p-2 shadow w-full">
  //                         <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s"
  //                             alt="Jacket Back" class=" object-contain w-full">
  //                     </div>
  //                 </div>
  //             </div>
  //         </section>
  //            <!-- Bill of Materials (BOM) -->
  //         <div class="mb-6">
  //             <div class="flex justify-start items-center bg-[#001F54] text-white ">
  //                 <p class="text-xl font-bold pl-4 py-1">Bill of Materials (BOM)</p>
  //             </div>
  //             <div class="border border-t-0 overflow-x-auto">
  //                 ${
  //                   tech_pack.tech_pack.materials && tech_pack.tech_pack.materials.length > 0
  //                     ? `
  //                 <table class="min-w-full text-sm">
  //                     <thead class="bg-gray-100">
  //                         <tr>
  //                             <th class="text-left py-2 px-4 font-semibold">Component</th>
  //                             <th class="text-left py-2 px-4 font-semibold">Material</th>
  //                             <th class="text-left py-2 px-4 font-semibold">Specification</th>
  //                             <th class="text-left py-2 px-4 font-semibold">Qty</th>
  //                             <th class="text-left py-2 px-4 font-semibold">Unit Cost</th>
  //                             <th class="text-left py-2 px-4 font-semibold">Notes</th>
  //                         </tr>
  //                     </thead>
  //                     <tbody>
  //                         ${tech_pack.tech_pack.materials
  //                           .map(
  //                             (material: any) => `
  //                         <tr class="border-b">
  //                             <td class="py-2 px-4">${material.component || ""}</td>
  //                             <td class="py-2 px-4">${material.material || ""}</td>
  //                             <td class="py-2 px-4">${material.specification || ""}</td>
  //                             <td class="py-2 px-4">${material.quantityPerUnit || ""}</td>
  //                             <td class="py-2 px-4">${material.unitCost || ""}</td>
  //                             <td class="py-2 px-4">${material.notes || ""}</td>
  //                         </tr>
  //                         `
  //                           )
  //                           .join("")}
  //                     </tbody>
  //                 </table>
  //                 `
  //                     : `<p class="text-gray-500 p-4">No materials specified.</p>`
  //                 }
  //             </div>
  //         </div>

  //     </div>
  // `;
  page1.innerHTML = `
    <div class="p-2">
        <div class="border-2 border-[#001F54] border-solid  relative p-4">
            <div class="bg-white border-b-4 border-[#001F54] text-center mb-4">
                <h1 class="text-2xl font-bold py-3">${tech_pack.tech_pack.productName || "Product Name"} Tech Pack</h1>
            </div>

            <!-- Product Details Grid -->
            <div>
                    <h1 class="text-xl font-bold pl-4 py-6 bg-[#001F54] text-white">Product Details</h1>
                <div class="grid grid-cols-2 gap-x-4 border-b-2 border-[#001F54] pb-4 p-3">
                    <div class="border-b-2 border-gray-300 pb-2">
                        <p class="font-semibold  text-sm text-gray-800">Product Description</p>
                        <p class="text-gray-700 text-sm">${
                          tech_pack.tech_pack.productOverview || "No description provided"
                        }</p>
                    </div>
                    <div class="border-b-2 border-gray-300 pb-2">
                        <p class="font-semibold  text-sm text-gray-800">Product Notes</p>
                        <p class="text-gray-700 text-sm">${tech_pack.tech_pack.productionNotes || "No notes provided"}
                        </p>
                    </div>
                    <div class="pt-2">
                        <p class="font-semibold  text-sm text-gray-800">Product Category</p>
                        <p class="text-gray-700 text-sm">${tech_pack.tech_pack.category_Subcategory || "Not specified"}
                        </p>
                    </div>
                    <div class="pt-2">
                        <p class="font-semibold  text-sm text-gray-800">Intended Market Age Range</p>
                        <p class="text-gray-700 text-sm">${
                          tech_pack.tech_pack.intendedMarket_AgeRange || "Not specified"
                        }</p>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 mt-4">
                <!-- Left Column -->
                <div>
                    <!-- Measurements & Tolerance -->
                    <div class="mb-6">
                        <div class="flex justify-start items-center bg-[#001F54] text-white ">
                            <p class="text-xl font-bold pl-4 py-1">Measurements & Tolerance</p>
                        </div>
                        <div class="border border-t-0 overflow-x-auto">
                            ${
                              tech_pack.tech_pack.dimensions &&
                              Array.isArray(tech_pack.tech_pack.dimensions.details) &&
                              tech_pack.tech_pack.dimensions.details.length > 0
                                ? `
                            <table class="min-w-full text-sm">
  <thead class="bg-gray-100">
    <tr>
      <th class="text-left py-2 px-4 font-semibold">Measurement</th>
      <th class="text-left py-2 px-4 font-semibold">Value</th>
      <th class="text-left py-2 px-4 font-semibold">Unit</th>
      <th class="text-left py-2 px-4 font-semibold">Tolerance</th>
    </tr>
  </thead>
  <tbody>
    ${tech_pack.tech_pack.dimensions.details
      .map((detail: any) =>
        Object.entries(detail)
          .map(
            ([key, val]: any) => `
            <tr class="border-b">
              <td class="py-2 px-4">${key}</td>
              <td class="py-2 px-4">${val?.value || "-"}</td>
              <td class="py-2 px-4">${val?.unit || "N/A"}</td>
              <td class="py-2 px-4">${val?.tolerance || "-"}</td>
            </tr>
          `
          )
          .join("")
      )
      .join("")}
  </tbody>
</table>
`
                                : `<p class="text-gray-500 ">No measurements provided.</p>`
                            }
                        </div>
                    </div>

                    <!-- Packaging -->
                    <div class="mb-6">
                        <div class="flex justify-start items-center bg-[#001F54] text-white ">
                            <p class="text-xl font-bold pl-4 py-1">Packaging</p>
                        </div>
                        <div class="border border-t-0 p-4 text-sm leading-6">
                            <ul class="list-disc pl-5 space-y-1">
                                <li><strong>Packaging Type:</strong> ${
                                  tech_pack.tech_pack.packaging?.packagingDetails?.packagingType || "N/A"
                                }</li>
                                <li><strong>Material Spec:</strong> ${
                                  tech_pack.tech_pack.packaging?.packagingDetails?.materialSpec || "N/A"
                                }</li>
                                <li><strong>Closure Type:</strong> ${
                                  tech_pack.tech_pack.packaging?.packagingDetails?.closureType || "N/A"
                                }</li>
                                <li><strong>Artwork File Reference:</strong> ${
                                  tech_pack.tech_pack.packaging?.packagingDetails?.artworkFileReference || "N/A"
                                }</li>
                                <li><strong>Inner Packaging:</strong> ${
                                  tech_pack.tech_pack.packaging?.packagingDetails?.innerPackaging || "N/A"
                                }</li>
                                <li><strong>Barcode & Label Placement:</strong> ${
                                  tech_pack.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || "N/A"
                                }</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <!-- Colorways -->
                    <div class="mb-6">
                        <div class="flex justify-start items-center bg-[#001F54] text-white ">
                            <p class="text-xl font-bold pl-4 py-1">Colorways</p>
                        </div>
                        <div class="border border-t-0 p-4 space-y-3">
                            ${
                              tech_pack.tech_pack.colors.primaryColors?.length > 0
                                ? `
                            <div>
                                <h3 class="font-semibold text-gray-700 ">Primary Colors</h3>
                                <div class="flex flex-wrap items-center gap-4 mt-1">
                                    ${tech_pack.tech_pack.colors.primaryColors
                                      .map(
                                        (color: any) => `
                                    <div class="flex items-center">
                                        <span class="w-4 h-4 rounded-full mr-2 border"
                                            style="background-color:${color.hex};"></span>
                                        <span class="text-sm">${color.name} (${color.hex})</span>
                                    </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>`
                                : `<p class="text-gray-500 text-sm ">No primary colors.</p>`
                            }
                            ${
                              tech_pack.tech_pack.colors.accentColors?.length > 0
                                ? `
                            <div>
                                <h3 class="font-semibold text-gray-700 ">Accent Colors</h3>
                                <div class="flex flex-wrap items-center gap-4 mt-1">
                                    ${tech_pack.tech_pack.colors.accentColors
                                      .map(
                                        (color: any) => `
                                    <div class="flex items-center">
                                        <span class="w-4 h-4 rounded-full mr-2 border"
                                            style="background-color:${color.hex};"></span>
                                        <span class="text-sm">${color.name} (${color.hex})</span>
                                    </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>`
                                : `<p class="text-gray-500 text-sm ">No accent colors.</p>`
                            }
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex justify-start items-center bg-[#001F54] text-white ">
                            <p class="text-xl font-bold pl-4 py-1">Quality Standards</p>
                        </div>
                        <div class="border border-t-0 p-4 text-sm">
                            <p>${tech_pack.tech_pack.qualityStandards || "No quality standards provided."}</p>
                        </div>
                    </div>

                    <div class="mb-6">
                        <div class="flex justify-start items-center bg-[#001F54] text-white ">
                            <p class="text-xl font-bold pl-4 py-1">Sizes</p>
                        </div>
                        <div class="border border-t-0 p-4 text-sm">
                            <p>${tech_pack.tech_pack.sizeRange?.gradingLogic || ""}</p>
                            <div class="mt-2 font-semibold">${
                              tech_pack.tech_pack.sizeRange?.sizes?.join(", ") || "No sizes specified."
                            }</div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="absolute bottom-4 right-4 h-12 w-12">
                <img src="/favicon.png" alt="Logo" class="h-full w-full object-contain" />
            </div>
        </div>
    </div>
`;

  // --- Page 2 HTML (BOM and Product Photos) ---
  page2.innerHTML = `
<div class="p-2">
    <div class="border-2 border-[#001F54] border-solid  relative p-4">
        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] text-center mb-4 -mt-4 -mx-4">
            <h1 class="text-2xl font-bold py-3">${tech_pack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <!-- Bill of Materials (BOM) -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-xl font-bold pl-4 py-1">Bill of Materials (BOM)</p>
            </div>
            <div class="border border-t-0 overflow-x-auto">
                ${
                  tech_pack.tech_pack.materials && tech_pack.tech_pack.materials.length > 0
                    ? `
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="text-left py-2 px-4 font-semibold">Component</th>
                            <th class="text-left py-2 px-4 font-semibold">Material</th>
                            <th class="text-left py-2 px-4 font-semibold">Specification</th>
                            <th class="text-left py-2 px-4 font-semibold">Qty</th>
                            <th class="text-left py-2 px-4 font-semibold">Unit Cost</th>
                            <th class="text-left py-2 px-4 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tech_pack.tech_pack.materials
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
                    : `<p class="text-gray-500 p-4">No materials specified.</p>`
                }
            </div>
        </div>

        <!-- Product Photos -->
        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-xl font-bold pl-4 py-1">Product Photos</p>
            </div>
            <div class="border border-t-0 p-4">
                <div class="grid grid-cols-3 gap-6">
                    ${["front", "back", "side"]
                      .map(
                        (view) => `
                    <div class="border rounded-lg overflow-hidden flex items-center justify-center bg-gray-200 aspect-[2/3]">
                        ${
                          tech_pack.image_data?.[view]?.url
                            ? `<img src="${tech_pack.image_data[view].url}" alt="${view} view" class="w-full h-full object-contain">`
                            : `<span class="text-gray-500 font-bold text-lg capitalize">${view}</span>`
                        }
                    </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        </div>

        <!-- Footer with Logo -->
        <div class="absolute bottom-4 right-4 h-12 w-12">
            <img src="/favicon.png" alt="Logo" class="h-full w-full object-contain"/>
        </div>
    </div>
</div>
  `;

  page3.innerHTML = `
      <div class="py-2">

          ${
            tech_pack.image_data && Object.values(tech_pack.image_data).length > 0
              ? `
            <div class="md:col-span-2 border p-4 rounded shadow image-container">
              <h2 class="text-xl font-semibold">Product Images</h2>
              <div class="flex flex-wrap gap-4 mt-4" style="page-break-inside: avoid;">
                ${(() => {
                  const hasOnlyFrontImage = !tech_pack.image_data.back && tech_pack.image_data.front?.url;

                  if (hasOnlyFrontImage) {
                    return `
                      <div class="w-full flex justify-center">
                        <div class="flex-shrink-0" style="width: 100%; max-width: 500px;">
                          <img
                            src="${tech_pack.image_data.front.url}"
                            alt="${tech_pack.tech_pack?.name || "Product"} - front view"
                            class="w-full h-auto max-h-[120mm] object-contain mx-auto"
                            onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
                            style="page-break-inside: avoid;"
                          />
                        </div>
                      </div>
                    `;
                  } else {
                    return Object.entries(tech_pack.image_data)
                      .filter(([_, imageData]: any) => imageData?.url)
                      .map(
                        ([key, imageData]) => `
                        <div class="flex-shrink-0" style="width: calc(50% - 0.5rem);">
                          <img
                            src="${(imageData as { url: string }).url}"
                            alt="${tech_pack.tech_pack?.name || "Product"} - ${key} view"
                            class="w-full h-auto max-h-[120mm] object-contain"
                            onerror="this.onerror=null;this.src='/placeholder.svg';this.alt='Image failed to load'"
                            style="page-break-inside: avoid;"
                          />
                        </div>
                      `
                      )
                      .join("");
                  }
                })()}
              </div>
            </div>
          `
              : ""
          }

      </div>
    `;
  document.body.appendChild(page1);
  document.body.appendChild(page2);
  document.body.appendChild(page3);

  //   let includePage3 = false;

  //   if (tech_pack.image_data && Object.keys(tech_pack.image_data).length > 0) {
  //   document.body.appendChild(page3);
  //     includePage3 = true;
  //   }

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const options = {
      scale: 2,
      logging: false,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    };
    const pages = [page1, page2, page3];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], options);
      const imgData = canvas.toDataURL("image/jpeg", 1);

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", 10, 10, 190, 0, undefined, "FAST");
    }

    pdf.save(tech_pack.tech_pack.productName + ".pdf");
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  } finally {
    [page1, page2, page3].forEach((page) => {
      if (page.parentNode) {
        document.body.removeChild(page);
      }
    });

    // if (includePage3 && page3.parentNode) {
    //   document.body.removeChild(page3);
    // }
  }
};




export const generatePdfBase64 = async ({ tech_pack }: { tech_pack: any }) => {
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
    <div class="border-2 border-[#001F54] border-solid ">
        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${tech_pack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <!-- Product Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Product Details</p>
            </div>
            <div class="border border-t-0 divide-y divide-blue-200">
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Product Description</p>
                    <p class="text-gray-700">${tech_pack.tech_pack.productOverview || "No description provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Product Notes</p>
                    <p class="text-gray-700">${tech_pack.tech_pack.productionNotes || "No notes provided"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Product Category</p>
                    <p class="text-gray-700">${tech_pack.tech_pack.category_Subcategory || "Not specified"}</p>
                </div>
                <div class="p-4">
                    <p class="font-semibold  text-sm text-gray-800">Intended Market Age Range</p>
                    <p class="text-gray-700">${tech_pack.tech_pack.intendedMarket_AgeRange || "Not specified"}</p>
                </div>
            </div>
        </div>


        <!-- BOM -->
        <div class="mb-6">
             <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Bill of Materials (BOM)</p>
            </div>
            <div class="border border-t-0 overflow-x-auto">
                ${
                  tech_pack.tech_pack.materials && tech_pack.tech_pack.materials.length > 0
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
                        ${tech_pack.tech_pack.materials
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
                     <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Measurements & Tolerance</p>
            </div>
                    <div class="border border-t-0 p-4 overflow-x-auto">
                        ${
                          tech_pack.tech_pack.dimensions &&
                          Array.isArray(tech_pack.tech_pack.dimensions.details) &&
                          tech_pack.tech_pack.dimensions.details.length > 0
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
                                ${tech_pack.tech_pack.dimensions.details
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
                            : `<p class="text-gray-500 ">No measurements provided.</p>`
                        }
                    </div>
                </div>

                <!-- Colorways -->
                <div>
                    <div class="flex justify-start items-center bg-[#001F54] text-white ">
                        <p class="text-2xl font-bold  pl-4 pb-2">Colorways</p>
                    </div>
                    <div class="border border-t-0 p-4 space-y-4 bg-gray-50">

                        <!-- Primary Colors -->
                        ${
                          tech_pack.tech_pack.colors.primaryColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 ">Primary Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${tech_pack.tech_pack.colors.primaryColors
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
                            : `<p class="text-gray-500 text-sm ">No primary colors specified</p>`
                        }

                        <!-- Accent Colors -->
                        ${
                          tech_pack.tech_pack.colors.accentColors?.length > 0
                            ? `
                        <div>
                            <h3 class="font-semibold text-gray-700 ">Accent Colors</h3>
                            <div class="flex flex-wrap items-center gap-4 mt-2">
                                ${tech_pack.tech_pack.colors.accentColors
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
                            : `<p class="text-gray-500 text-sm ">No accent colors specified</p>`
                        }

                    </div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4">
                ${
                  tech_pack.tech_pack.qualityStandards
                    ? `
                <p class="text-gray-700">${tech_pack.tech_pack.qualityStandards}</p>
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
    <div class="border-2 border-[#001F54] border-solid ">

        <!-- Header -->
        <div class="bg-white border-b-4 border-[#001F54] p-3 text-center">
            <h1 class="text-2xl font-bold">${tech_pack.tech_pack.productName || "Product Name"} Tech Pack</h1>
        </div>

        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Packaging</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <ul class="list-disc pl-6 space-y-1">
                    <li><strong>Packaging Type:</strong> ${
                      tech_pack.tech_pack.packaging?.packagingDetails?.packagingType || ""
                    }</li>
                    <li><strong>Material Spec:</strong>
                        ${tech_pack.tech_pack.packaging?.packagingDetails?.materialSpec || ""}</li>
                    <li><strong>Closure Type:</strong> ${
                      tech_pack.tech_pack.packaging?.packagingDetails?.closureType || ""
                    }
                    </li>
                    <li><strong>Artwork File Reference:</strong>
                        ${tech_pack.tech_pack.packaging?.packagingDetails?.artworkFileReference || ""}</li>
                    <li><strong>Inner Packaging:</strong> ${
                      tech_pack.tech_pack.packaging?.packagingDetails?.innerPackaging || ""
                    }</li>
                    <li><strong>Barcode & Label Placement:</strong>
                        ${tech_pack.tech_pack.packaging?.packagingDetails?.barcodeAndLabelPlacement || ""}</li>
                </ul>
            </div>
        </div>

        <!-- Sizes Section -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Sizes</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${tech_pack.tech_pack.sizeRange?.gradingLogic || ""}
                <div class="mt-2 font-semibold">
                    ${tech_pack.tech_pack.sizeRange?.sizes?.join(", ") || ""}
                </div>
            </div>
        </div>

        <!-- Construction Details -->
        <div class="mb-6">
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Construction Details</p>
            </div>
            <div class="border border-t-0 p-4 text-sm leading-6">
                <p class="mb-2 text-gray-700">
                    ${tech_pack.tech_pack.constructionDetails?.description || ""}
                </p>
                ${
                  tech_pack.tech_pack.constructionDetails.constructionFeatures?.length > 0
                    ? `
                <ul class="list-disc pl-6 space-y-1">
                    ${tech_pack.tech_pack.constructionDetails.constructionFeatures
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
            <div class="flex justify-start items-center bg-[#001F54] text-white ">
                <p class="text-2xl font-bold  pl-4 pb-2">Quality Standards</p>
            </div>
            <div class="border border-t-0 p-4 text-sm">
                ${tech_pack.tech_pack.qualityStandards || ""}
            </div>
        </div>

        <!-- Product Photos -->
        <div class="mb-4">
  <div class="flex justify-start items-center bg-[#001F54] text-white ">
    <p class="text-2xl font-bold pl-4 pb-2">Product Photos</p>
  </div>
  <div class="border border-t-0 p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

      <!-- Front -->
      <div class="border rounded-2xl overflow-hidden flex items-center justify-center  aspect-[2/3]">
        ${
          tech_pack.image_data?.front?.url
            ? `<img src="${tech_pack.image_data.front.url}" alt="Front view"
                class="w-full h-auto object-contain">`
            : `<span class="text-white font-bold text-lg">Front</span>`
        }
      </div>

      <!-- Back -->
      <div class="border rounded-2xl overflow-hidden flex items-center justify-center  aspect-[2/3]">
        ${
          tech_pack.image_data?.back?.url
            ? `<img src="${tech_pack.image_data.back.url}" alt="Back view"
                class="w-full h-auto object-contain">`
            : `<span class="text-white font-bold text-lg">Back</span>`
        }
      </div>

      <!-- Side -->
      <div class="border rounded-2xl overflow-hidden flex items-center justify-center  aspect-[2/3]">
        ${
          tech_pack.image_data?.side?.url
            ? `<img src="${tech_pack.image_data.side.url}" alt="Side view"
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
