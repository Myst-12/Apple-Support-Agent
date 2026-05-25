import requests
from bs4 import BeautifulSoup
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma

# Apple support pages to scrape
urls = [
    # iPhone main pages
    "https://www.apple.com/iphone/",
    "https://www.apple.com/iphone/compare/",
    "https://www.apple.com/shop/buy-iphone",

    # iPhone 16 series
    "https://www.apple.com/iphone-16/",
    "https://www.apple.com/iphone-16/specs/",
    "https://www.apple.com/iphone-16-pro/",
    "https://www.apple.com/iphone-16-pro/specs/",
    "https://www.apple.com/iphone-16e/",
    "https://www.apple.com/iphone-16e/specs/",

    # iPhone 15 series
    "https://www.apple.com/iphone-15/",
    "https://www.apple.com/iphone-15/specs/",
    "https://www.apple.com/iphone-15-pro/",
    "https://www.apple.com/iphone-15-pro/specs/",

    # iPhone 14 series
    "https://www.apple.com/iphone-14/",
    "https://www.apple.com/iphone-14/specs/",

    # iOS and software
    "https://www.apple.com/ios/ios-18/",
    "https://www.apple.com/apple-intelligence/",

    # AppleCare and warranty
    "https://www.apple.com/support/products/iphone/",
    "https://support.apple.com/en-us/100100",
    "https://support.apple.com/en-us/103824",

    # Battery
    "https://support.apple.com/en-us/111900",
    "https://www.apple.com/batteries/service-and-recycling/",

    # Apple ID and iCloud
    "https://support.apple.com/apple-id",
    "https://support.apple.com/en-us/108937",
    "https://support.apple.com/icloud",
    "https://support.apple.com/en-us/104959",
    "https://www.apple.com/icloud/",

    # Common iPhone issues
    "https://support.apple.com/en-us/111786",  # won't turn on
    "https://support.apple.com/en-us/101591",  # Face ID
    "https://support.apple.com/en-us/111829",  # update iOS
    "https://support.apple.com/en-us/108771",  # forgotten passcode
    "https://support.apple.com/en-us/111947",  # water damage
    "https://support.apple.com/en-us/101215",  # screen repair
    "https://support.apple.com/en-us/103235",  # restore iPhone

    # Pricing and repairs
    "https://support.apple.com/iphone/repair/service",
    "https://www.apple.com/shop/trade-in",

    # Accessories
    "https://www.apple.com/shop/buy-iphone/accessories",

    # General support
    "https://support.apple.com/iphone",
    "https://support.apple.com/en-us/111939",  # contact support
]

def scrape_page(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    # Remove navigation and footer noise
    for tag in soup(["nav", "footer", "header", "script", "style"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)

print("Scraping Apple support pages...")
docs = []
for url in urls:
    print(f"Scraping {url}...")
    text = scrape_page(url)
    docs.append(Document(page_content=text, metadata={"source": url}))

print(f"Scraped {len(docs)} pages")

with open("apple_data.txt", "r") as f:
    extra_text = f.read()

# Split manual data into smaller chunks by line
lines = extra_text.split("\n")
for line in lines:
    line = line.strip()
    if line and len(line) > 20:
        docs.append(Document(page_content=line, metadata={"source": "manual"}))

# Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)
print(f"Total chunks: {len(chunks)}")

# Store in ChromaDB
embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma.from_documents(chunks, embeddings, persist_directory="./apple_db")
print("Stored in vector database!")