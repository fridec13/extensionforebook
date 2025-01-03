class WebAppInterface(private val context: Context) {
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun getScreenMetrics(): String {
        val metrics = context.resources.displayMetrics
        return "{\"width\":${metrics.widthPixels},\"height\":${metrics.heightPixels},\"density\":${metrics.density}}"
    }
} 