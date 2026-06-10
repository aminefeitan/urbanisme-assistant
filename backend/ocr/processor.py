"""
OCR Processor — Tesseract based (free, CPU-only, runs fine on i5 + 8GB RAM)
Triggered only when a new PDF is uploaded (loi update).
"""

import pytesseract
from pdf2image import convert_from_bytes, convert_from_path
from PIL import Image, ImageFilter, ImageOps
import re
import os
from typing import List, Dict

# ─── Windows PATH fix ────────────────────────────────────────────────────────
# Force Tesseract path for Windows (Python doesn't always inherit PATH from CMD)
TESSERACT_PATHS = [r"C:\Program Files\Tesseract-OCR\tesseract.exe"]

for _t in TESSERACT_PATHS:
    if os.path.exists(_t):
        pytesseract.pytesseract.tesseract_cmd = _t
        print(f"[OCR] ✅ Tesseract: {_t}")
        break
else:
    print("[OCR] ⚠️  Tesseract not found at known paths — relying on PATH")

# Poppler path for Windows (needed by pdf2image)
POPPLER_PATHS = [r"C:\poppler-25.12.0\Library\bin"]

POPPLER_PATH = None
for _p in POPPLER_PATHS:
    if os.path.exists(_p):
        POPPLER_PATH = _p
        print(f"[OCR] ✅ Poppler: {_p}")
        break
else:
    print("[OCR] ⚠️  Poppler not found at known paths — relying on PATH")


# ─── Quick diagnostic (called on startup) ────────────────────────────────────

def diagnose():
    """Print diagnostic info about Tesseract + Poppler availability."""
    print("\n[OCR Diagnostic]")
    try:
        ver = pytesseract.get_tesseract_version()
        print(f"  Tesseract version : {ver}")
        langs = pytesseract.get_languages()
        print(f"  Languages available: {langs}")
        if "ara" not in langs:
            print("  ⚠️  Arabic (ara) NOT installed — OCR quality will be poor for Arabic text")
        if "fra" not in langs:
            print("  ⚠️  French (fra) NOT installed")
    except Exception as e:
        print(f"  ❌ Tesseract ERROR: {e}")
        print("  → Make sure Tesseract is installed and in PATH")

    try:
        from pdf2image.exceptions import PDFInfoNotInstalledError
        print(f"  Poppler path used : {POPPLER_PATH or 'system PATH'}")
    except Exception as e:
        print(f"  Poppler check error: {e}")
    print()


# ─── PDF → Images ─────────────────────────────────────────────────────────────

def pdf_to_images(pdf_bytes: bytes = None, pdf_path: str = None) -> List[Image.Image]:
    """Convert PDF pages to PIL images at 300 DPI."""
    kwargs = {"dpi": 300}
    if POPPLER_PATH:
        kwargs["poppler_path"] = POPPLER_PATH
    if pdf_bytes:
        return convert_from_bytes(pdf_bytes, **kwargs)
    if pdf_path:
        return convert_from_path(pdf_path, **kwargs)
    raise ValueError("Provide pdf_bytes or pdf_path")


# ─── Image Preprocessing ──────────────────────────────────────────────────────

def preprocess_image(image: Image.Image) -> Image.Image:
    image = image.convert("L")
    image = ImageOps.autocontrast(image)
    image = image.filter(ImageFilter.SHARPEN)
    return image


# ─── OCR ──────────────────────────────────────────────────────────────────────

def ocr_image(image: Image.Image, lang: str = "fra+ara") -> str:
    processed = preprocess_image(image)
    config = "--psm 6 --oem 3"
    try:
        return pytesseract.image_to_string(processed, lang=lang, config=config)
    except Exception as e:
        print(f"  [OCR] ⚠️  lang='{lang}' failed ({e}), retrying with 'fra'")
        try:
            return pytesseract.image_to_string(processed, lang="fra", config=config)
        except Exception as e2:
            print(f"  [OCR] ❌ OCR completely failed: {e2}")
            return ""


def ocr_pdf(pdf_bytes: bytes = None, pdf_path: str = None, lang: str = "fra+ara") -> str:
    """Full OCR pipeline: PDF → images → text."""
    images = pdf_to_images(pdf_bytes=pdf_bytes, pdf_path=pdf_path)
    pages_text = []
    for i, img in enumerate(images, 1):
        print(f"  [OCR] page {i}/{len(images)}...")
        text = ocr_image(img, lang=lang)
        pages_text.append(f"--- PAGE {i} ---\n{text}")
    return "\n\n".join(pages_text)


# ─── Article Parser ────────────────────────────────────────────────────────────

def parse_articles(text: str) -> List[Dict]:
    articles = []
    patterns = [
        r"(?:Article|ARTICLE)\s+(\d+)\s*[:\-–]?\s*(.*?)(?=(?:Article|ARTICLE)\s+\d+|\Z)",
        r"(?:المادة|مادة)\s+(\d+)\s*(.*?)(?=(?:المادة|مادة)\s+\d+|\Z)",
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
        for num, content in matches:
            content = content.strip()
            if len(content) > 40:
                lines = [l for l in content.split("\n") if l.strip()]
                titre = lines[0].strip()[:200] if lines else f"Article {num}"
                articles.append({
                    "article_number": num.strip(),
                    "titre": titre,
                    "contenu": content,
                })
        if articles:
            break

    if not articles:
        chunks = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 80]
        for i, chunk in enumerate(chunks, 1):
            articles.append({
                "article_number": f"P{i}",
                "titre": chunk[:120],
                "contenu": chunk,
            })

    return articles
    