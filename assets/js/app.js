const TradesStoreKey = "scalpe_trades";

const selectors = {
    logoIntro: ".logo-intro",
    tradeForm: "#tradeForm",
    tradesTable: "#tradesTable",
    resetTrades: "#resetTrades",
    faqItems: ".faq-item",
    billingToggle: "#billingToggle",
    planCards: ".plan-card",
    selectPlanButtons: ".select-plan",
    selectedPlanLabel: "#selectedPlanLabel",
    selectedPlanPrice: "#selectedPlanPrice",
    paymentForm: "#paymentForm",
};

const utils = {
    byQS: (selector) => document.querySelector(selector),
    byQSA: (selector) => [...document.querySelectorAll(selector)],
    generateId: () => crypto.randomUUID?.() ?? String(Date.now()),
};

const LogoIntro = (() => {
    const init = () => {
        const logo = utils.byQS(selectors.logoIntro);
        if (!logo) return;
        setTimeout(() => logo.classList.add("hidden"), 1500);
        logo.addEventListener("animationend", () => logo.remove());
    };
    return { init };
})();

const LoginPage = (() => {
    const init = () => {
        const form = document.getElementById("loginForm");
        if (!form) return;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const payload = {
                email: formData.get("email"),
                remember: formData.get("remember") === "on",
            };
            sessionStorage.setItem("scalpe_user", JSON.stringify(payload));
            window.location.href = "home.html";
        });
    };
    return { init };
})();

const marketMeta = {
    global: {
        label: "Global / Crypto",
        currency: "USD",
        symbol: "$",
        placeholder: "e.g. BTC-USD",
        locale: "en-US",
    },
    nse: {
        label: "NSE India",
        currency: "INR",
        symbol: "₹",
        placeholder: "e.g. NSE:INFY",
        locale: "en-IN",
    },
    bse: {
        label: "BSE India",
        currency: "INR",
        symbol: "₹",
        placeholder: "e.g. BSE:RELIANCE",
        locale: "en-IN",
    },
};

const getMarketMeta = (marketKey = "global") => marketMeta[marketKey] || marketMeta.global;

const formatPriceForMarket = (value, marketKey = "global") => {
    if (value === undefined || value === null || value === "") return "--";
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return value;
    const meta = getMarketMeta(marketKey);
    return `${meta.symbol}${parsed.toLocaleString(meta.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const TradesModule = (() => {
    let tradeFormRef = null;
    let updateHintsRef = null;

    const loadTrades = () => {
        try {
            return JSON.parse(localStorage.getItem(TradesStoreKey)) ?? [];
        } catch {
            return [];
        }
    };

    const saveTrades = (trades) => {
        localStorage.setItem(TradesStoreKey, JSON.stringify(trades));
    };

    const renderTrades = () => {
        const table = utils.byQS(selectors.tradesTable);
        if (!table) return;
        const trades = loadTrades();
        if (!trades.length) {
            table.innerHTML = `<tr><td colspan="6" class="empty">No trades yet. Add your first scalp idea.</td></tr>`;
            return;
        }
        table.innerHTML = trades
            .map(
                (trade) => `
                <tr data-id="${trade.id}">
                    <td>${trade.asset}</td>
                    <td>
                        <span class="market-pill" data-market="${trade.market ?? "global"}">
                            ${getMarketMeta(trade.market).label}
                        </span>
                    </td>
                    <td>${trade.bias}</td>
                    <td>${formatPriceForMarket(trade.entry, trade.market)}</td>
                    <td>${formatPriceForMarket(trade.target, trade.market)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="edit">Edit</button>
                            <button class="delete">Delete</button>
                        </div>
                    </td>
                </tr>
            `
            )
            .join("");
    };

    const bindTableEvents = () => {
        const table = utils.byQS(selectors.tradesTable);
        if (!table) return;
        table.addEventListener("click", (event) => {
            const row = event.target.closest("tr");
            if (!row) return;
            const tradeId = row.dataset.id;
            if (event.target.matches(".delete")) {
                const trades = loadTrades().filter((trade) => trade.id !== tradeId);
                saveTrades(trades);
                renderTrades();
            }
            if (event.target.matches(".edit")) {
                const trade = loadTrades().find((item) => item.id === tradeId);
                if (!trade) return;
                const form = document.getElementById("tradeForm");
                form.tradeId.value = trade.id;
                form.asset.value = trade.asset;
                form.market.value = trade.market ?? "global";
                form.bias.value = trade.bias;
                form.entry.value = trade.entry;
                form.target.value = trade.target;
                updateHintsRef?.(form.market.value);
                form.querySelector("button[type='submit']").textContent = "Update Position";
            }
        });
    };

    const bindForm = () => {
        const form = utils.byQS(selectors.tradeForm);
        if (!form) return;
        tradeFormRef = form;
        const entryCurrency = form.querySelector("[data-entry-currency]");
        const targetCurrency = form.querySelector("[data-target-currency]");
        const marketField = form.querySelector("select[name='market']");

        const applyMarketHints = (marketKey) => {
            const meta = getMarketMeta(marketKey);
            if (form.asset) form.asset.placeholder = meta.placeholder;
            if (entryCurrency) entryCurrency.textContent = meta.symbol;
            if (targetCurrency) targetCurrency.textContent = meta.symbol;
        };

        updateHintsRef = applyMarketHints;
        applyMarketHints(marketField?.value || "nse");
        marketField?.addEventListener("change", (event) => applyMarketHints(event.target.value));

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const trades = loadTrades();
            const formData = new FormData(form);
            const payload = {
                id: formData.get("tradeId") || utils.generateId(),
                asset: formData.get("asset").toUpperCase(),
                market: formData.get("market") || "global",
                bias: formData.get("bias"),
                entry: Number(formData.get("entry")).toFixed(2),
                target: Number(formData.get("target")).toFixed(2),
            };
            const existingIndex = trades.findIndex((trade) => trade.id === payload.id);
            if (existingIndex >= 0) {
                trades[existingIndex] = payload;
            } else {
                trades.push(payload);
            }
            saveTrades(trades);
            renderTrades();
            form.reset();
            form.market.value = "nse";
            updateHintsRef?.("nse");
            form.querySelector("button[type='submit']").textContent = "Add Position";
        });

        const reset = utils.byQS(selectors.resetTrades);
        reset?.addEventListener("click", () => {
            if (confirm("Clear all saved trades?")) {
                localStorage.removeItem(TradesStoreKey);
                renderTrades();
            }
        });
    };

    const init = () => {
        renderTrades();
        bindTableEvents();
        bindForm();
    };

    return { init, renderTrades };
})();

const IndiaMarketModule = (() => {
    const tickerData = [
        { symbol: "NIFTY 50", price: 22542.65, change: 0.42 },
        { symbol: "BANK NIFTY", price: 48420.3, change: -0.18 },
        { symbol: "SENSEX", price: 74210.1, change: 0.28 },
        { symbol: "RELIANCE", price: 2874.9, change: 0.61 },
        { symbol: "INFY", price: 1536.15, change: -0.34 },
    ];

    const leaderData = [
        { name: "RELIANCE", sector: "Oil & Gas", flow: "+₹1,280 Cr" },
        { name: "HDFCBANK", sector: "Banking", flow: "+₹960 Cr" },
        { name: "TCS", sector: "IT Services", flow: "-₹420 Cr" },
        { name: "ADANIPORTS", sector: "Infra", flow: "+₹310 Cr" },
    ];

    const eventData = [
        { title: "RBI Policy Presser", time: "07 Dec • 10:00 IST" },
        { title: "INFY Buyback Vote", time: "08 Dec • 13:30 IST" },
        { title: "Weekly F&O Expiry", time: "12 Dec • All Day" },
    ];

    const tickerList = document.getElementById("indiaTickerList");
    const statusLabel = document.getElementById("indiaMarketStatus");
    const leadersContainer = document.getElementById("indiaMarketLeaders");
    const eventsContainer = document.getElementById("indiaMarketEvents");
    const sessionLabel = document.getElementById("indiaSessionLabel");
    let tickerIndex = 0;
    let tickerIntervalId = null;
    let sessionIntervalId = null;

    const renderTickers = () => {
        if (!tickerList) return;
        const slice = tickerData.slice(tickerIndex, tickerIndex + 3);
        if (slice.length < 3) {
            slice.push(...tickerData.slice(0, 3 - slice.length));
        }
        tickerList.innerHTML = slice
            .map(
                (item) => `
            <div class="ticker">
                <span>${item.symbol}</span>
                <strong>${formatPriceForMarket(item.price, "nse")}</strong>
                <span class="${item.change >= 0 ? "gain" : "loss"}">
                    ${item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}%
                </span>
            </div>
        `
            )
            .join("");
        tickerIndex = (tickerIndex + 1) % tickerData.length;
    };

    const renderLeaders = () => {
        if (!leadersContainer) return;
        leadersContainer.innerHTML = leaderData
            .map(
                (leader) => `
            <div class="india-leader-row">
                <div class="leader-meta">
                    <strong>${leader.name}</strong>
                    <span>${leader.sector}</span>
                </div>
                <span class="${leader.flow.startsWith("-") ? "loss" : "gain"}">${leader.flow}</span>
            </div>
        `
            )
            .join("");
    };

    const renderEvents = () => {
        if (!eventsContainer) return;
        eventsContainer.innerHTML = eventData
            .map((event) => `<li><strong>${event.title}</strong><span>${event.time}</span></li>`)
            .join("");
    };

    const updateSessionLabel = () => {
        if (!sessionLabel || !statusLabel) return;
        const now = new Date();
        const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const istDate = new Date(istString);
        const minutes = istDate.getHours() * 60 + istDate.getMinutes();
        const openMinutes = 9 * 60 + 15;
        const closeMinutes = 15 * 60 + 30;

        let status = "Closed";
        if (minutes >= openMinutes && minutes <= closeMinutes) {
            status = "Cash session LIVE";
        } else if (minutes < openMinutes) {
            status = "Pre-open";
        }

        const timeLabel = istDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });

        sessionLabel.textContent = `India (IST) ${timeLabel} • ${status}`;
        statusLabel.textContent = status === "Cash session LIVE" ? "NSE cash session active" : `India session: ${status}`;
    };

    const init = () => {
        if (!tickerList || !leadersContainer || !eventsContainer) return;
        renderTickers();
        renderLeaders();
        renderEvents();
        updateSessionLabel();
        tickerIntervalId = setInterval(renderTickers, 5000);
        sessionIntervalId = setInterval(updateSessionLabel, 60000);
        window.addEventListener("beforeunload", () => {
            if (tickerIntervalId) clearInterval(tickerIntervalId);
            if (sessionIntervalId) clearInterval(sessionIntervalId);
        });
    };

    return { init };
})();

const FAQModule = (() => {
    const init = () => {
        const items = utils.byQSA(selectors.faqItems);
        if (!items.length) return;
        items.forEach((item) => {
            const button = item.querySelector(".faq-question");
            button?.addEventListener("click", () => {
                item.classList.toggle("active");
            });
        });
    };
    return { init };
})();

const SubscriptionModule = (() => {
    let yearly = false;
    let selectedPlan = null;

    const formatPrice = (amount) => `$${amount.toFixed(0)} / mo`;

    const updateCards = () => {
        utils.byQSA(selectors.planCards).forEach((card) => {
            const monthly = Number(card.dataset.monthly);
            const yearlyPrice = Number(card.dataset.yearly);
            const price = yearly ? yearlyPrice : monthly;
            const priceElement = card.querySelector(".price");
            if (priceElement) {
                priceElement.innerHTML = `${price} <span>/mo</span>`;
            }
        });
        updateSummary();
    };

    const updateSummary = () => {
        const label = utils.byQS(selectors.selectedPlanLabel);
        const priceEl = utils.byQS(selectors.selectedPlanPrice);
        if (!label || !priceEl) return;
        if (!selectedPlan) {
            label.textContent = "None";
            priceEl.textContent = "$0";
            return;
        }
        label.textContent = `${selectedPlan.plan} (${yearly ? "Yearly" : "Monthly"})`;
        priceEl.textContent = formatPrice(selectedPlan.price);
    };

    const bindToggle = () => {
        const toggle = utils.byQS(selectors.billingToggle);
        if (!toggle) return;
        toggle.addEventListener("change", (event) => {
            yearly = event.target.checked;
            updateCards();
        });
    };

    const bindPlanSelection = () => {
        utils.byQSA(selectors.selectPlanButtons).forEach((button) => {
            button.addEventListener("click", (event) => {
                const card = event.target.closest(".plan-card");
                if (!card) return;
                utils.byQSA(selectors.planCards).forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");
                selectedPlan = {
                    plan: card.dataset.plan,
                    price: yearly ? Number(card.dataset.yearly) : Number(card.dataset.monthly),
                };
                updateSummary();
            });
        });
    };

    const bindPaymentForm = () => {
        const form = utils.byQS(selectors.paymentForm);
        if (!form) return;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!selectedPlan) {
                alert("Please select a plan to continue.");
                return;
            }
            const formData = new FormData(form);
            const summary = {
                plan: selectedPlan.plan,
                cadence: yearly ? "Yearly" : "Monthly",
                paymentRail: formData.get("payment"),
                company: formData.get("company"),
                contact: formData.get("contact"),
            };
            alert(`Subscription locked:\n${JSON.stringify(summary, null, 2)}`);
            form.reset();
            utils.byQSA(selectors.planCards).forEach((c) => c.classList.remove("selected"));
            selectedPlan = null;
            updateSummary();
        });
    };

    const init = () => {
        updateCards();
        bindToggle();
        bindPlanSelection();
        bindPaymentForm();
    };

    return { init };
})();

const AnalysisModule = (() => {
    const API_KEY_STORAGE = "scalpe_gemini_api_key";
    const ANALYSIS_HISTORY_STORAGE = "scalpe_analysis_history";
    const MAX_HISTORY = 10;

    let currentImageFile = null;
    let currentImageBase64 = null;

    const getApiKey = () => {
        return localStorage.getItem(API_KEY_STORAGE) || "";
    };

    const saveApiKey = (key) => {
        localStorage.setItem(API_KEY_STORAGE, key);
    };

    const loadHistory = () => {
        try {
            return JSON.parse(localStorage.getItem(ANALYSIS_HISTORY_STORAGE)) || [];
        } catch {
            return [];
        }
    };

    const saveHistory = (history) => {
        const limited = history.slice(0, MAX_HISTORY);
        localStorage.setItem(ANALYSIS_HISTORY_STORAGE, JSON.stringify(limited));
    };

    const addToHistory = (imageData, analysis) => {
        const history = loadHistory();
        history.unshift({
            id: utils.generateId(),
            timestamp: Date.now(),
            image: imageData,
            analysis: analysis,
        });
        saveHistory(history);
        renderHistory();
    };

    const imageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const analyzeImage = async (base64Image) => {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error("Please enter your Gemini API key first.");
        }

        const prompt = `You are an expert trading analyst. Analyze this trading chart image and provide:
1. Chart pattern identification (e.g., head and shoulders, triangles, flags, etc.)
2. Trend analysis (bullish, bearish, or neutral)
3. Key support and resistance levels
4. Potential entry and exit points
5. Risk assessment
6. Trading recommendations

Be specific, professional, and actionable. Format your response in clear sections.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                                {
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: base64Image,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
                error.error?.message || `API Error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated.";
    };

    const renderHistory = () => {
        const historyList = document.getElementById("historyList");
        if (!historyList) return;

        const history = loadHistory();
        if (!history.length) {
            historyList.innerHTML = '<p class="empty">No analysis history yet. Upload an image to get started.</p>';
            return;
        }

        historyList.innerHTML = history
            .map(
                (item) => `
            <div class="history-item">
                <div class="history-image">
                    <img src="data:image/jpeg;base64,${item.image}" alt="Chart">
                </div>
                <div class="history-content">
                    <p class="history-time">${new Date(item.timestamp).toLocaleString()}</p>
                    <p class="history-preview">${item.analysis.substring(0, 150)}...</p>
                    <button class="ghost-btn view-history" data-id="${item.id}">View Full</button>
                </div>
            </div>
        `
            )
            .join("");

        historyList.querySelectorAll(".view-history").forEach((btn) => {
            btn.addEventListener("click", () => {
                const item = history.find((h) => h.id === btn.dataset.id);
                if (item) {
                    showResults(item.analysis, item.image);
                }
            });
        });
    };

    const showResults = (analysis, imageData = null) => {
        const resultsDiv = document.getElementById("analysisResults");
        const resultsContent = document.getElementById("resultsContent");
        if (!resultsDiv || !resultsContent) return;

        resultsContent.innerHTML = `
            <div class="analysis-text">
                ${analysis.split("\n").map((line) => {
                    if (line.trim().startsWith("#") || /^\d+\./.test(line.trim())) {
                        return `<h4>${line}</h4>`;
                    }
                    return `<p>${line || "<br>"}</p>`;
                }).join("")}
            </div>
        `;
        resultsDiv.style.display = "block";
        resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const bindApiKey = () => {
        const input = document.getElementById("apiKeyInput");
        const saveBtn = document.getElementById("saveApiKey");
        if (!input || !saveBtn) return;

        const savedKey = getApiKey();
        if (savedKey) {
            input.value = "•".repeat(20);
            input.type = "text";
        }

        saveBtn.addEventListener("click", () => {
            const key = input.value.trim();
            if (!key) {
                alert("Please enter a valid API key.");
                return;
            }
            saveApiKey(key);
            input.value = "•".repeat(20);
            input.type = "text";
            alert("API key saved successfully!");
        });

        input.addEventListener("focus", () => {
            if (input.value === "•".repeat(20)) {
                input.value = "";
                input.type = "password";
            }
        });
    };

    const bindUpload = () => {
        const uploadZone = document.getElementById("uploadZone");
        const imageInput = document.getElementById("imageInput");
        const imagePreview = document.getElementById("imagePreview");
        const previewImg = document.getElementById("previewImg");
        const removeBtn = document.getElementById("removeImage");
        const analyzeBtn = document.getElementById("analyzeBtn");

        if (!uploadZone || !imageInput || !imagePreview || !previewImg) return;

        const handleFile = async (file) => {
            if (!file.type.startsWith("image/")) {
                alert("Please upload a valid image file.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert("Image size must be less than 10MB.");
                return;
            }

            currentImageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                uploadZone.style.display = "none";
                imagePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        };

        uploadZone.addEventListener("click", () => imageInput.click());
        uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadZone.classList.add("dragover");
        });
        uploadZone.addEventListener("dragleave", () => {
            uploadZone.classList.remove("dragover");
        });
        uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadZone.classList.remove("dragover");
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        });

        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
        });

        removeBtn?.addEventListener("click", () => {
            currentImageFile = null;
            currentImageBase64 = null;
            imageInput.value = "";
            uploadZone.style.display = "block";
            imagePreview.style.display = "none";
        });

        analyzeBtn?.addEventListener("click", async () => {
            if (!currentImageFile) {
                alert("Please upload an image first.");
                return;
            }

            const btnText = analyzeBtn.querySelector(".btn-text");
            const btnLoader = analyzeBtn.querySelector(".btn-loader");
            analyzeBtn.disabled = true;
            btnText.style.display = "none";
            btnLoader.style.display = "inline";

            try {
                currentImageBase64 = await imageToBase64(currentImageFile);
                const analysis = await analyzeImage(currentImageBase64);
                showResults(analysis, currentImageBase64);
                addToHistory(currentImageBase64, analysis);
            } catch (error) {
                alert(`Analysis failed: ${error.message}`);
            } finally {
                analyzeBtn.disabled = false;
                btnText.style.display = "inline";
                btnLoader.style.display = "none";
            }
        });
    };

    const bindResults = () => {
        const clearBtn = document.getElementById("clearResults");
        clearBtn?.addEventListener("click", () => {
            const resultsDiv = document.getElementById("analysisResults");
            if (resultsDiv) resultsDiv.style.display = "none";
        });
    };

    const init = () => {
        bindApiKey();
        bindUpload();
        bindResults();
        renderHistory();
    };

    return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
    LogoIntro.init();
    const page = document.body.dataset.page;
    if (page === "login") LoginPage.init();
    if (page === "home") {
        TradesModule.init();
        IndiaMarketModule.init();
    }
    if (page === "faq") FAQModule.init();
    if (page === "subscriptions") SubscriptionModule.init();
    if (page === "analysis") AnalysisModule.init();
});

