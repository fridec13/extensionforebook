class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var prevButton: ImageButton
    private lateinit var nextButton: ImageButton
    private lateinit var einkModeSwitch: Switch

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setupWebView()
        setupButtons()
        setupEinkMode()
    }

    private fun setupWebView() {
        webView = findViewById(R.id.webView)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            // E-ink 디스플레이 최적화
            setLayerType(View.LAYER_TYPE_HARDWARE, null)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // content.js 주입
                injectEReaderScript()
            }
        }

        // JavaScript 인터페이스 추가
        webView.addJavascriptInterface(WebAppInterface(this), "Android")
    }

    private fun injectEReaderScript() {
        val script = assets.open("content.js").bufferedReader().use { it.readText() }
        webView.evaluateJavascript(script, null)
    }

    private fun setupButtons() {
        prevButton = findViewById(R.id.prevButton)
        nextButton = findViewById(R.id.nextButton)

        prevButton.setOnClickListener {
            webView.evaluateJavascript("window.eReaderView.previousPage()", null)
        }

        nextButton.setOnClickListener {
            webView.evaluateJavascript("window.eReaderView.nextPage()", null)
        }
    }

    private fun setupEinkMode() {
        einkModeSwitch = findViewById(R.id.einkModeSwitch)
        einkModeSwitch.setOnCheckedChangeListener { _, isChecked ->
            webView.evaluateJavascript("window.eReaderView.toggleEinkMode()", null)
        }
    }
} 