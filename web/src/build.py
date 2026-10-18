# Builds web/index.html from src/: inlines Emi's SVG and CSS so the page is one self-contained file.
import pathlib
src = pathlib.Path(__file__).parent
app = (src / "app.html").read_text()
app = app.replace("/*EMI_CSS*/", (src / "emi.css").read_text())
app = app.replace("<!--EMI_SVG-->", (src / "emi-svg.html").read_text())
(src.parent / "index.html").write_text(app)
print("built", len(app), "bytes")
