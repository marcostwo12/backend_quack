require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client } = require("@notionhq/client");
const gTTS = require('gtts');
const DiskStorage = require("../providers/DiskStorage")

const pageId = process.env.NOTION_PAGE_ID;
const apiKey = process.env.NOTION_API_KEY;
const { AssemblyAI } = require('assemblyai');


const notion = new Client({ auth: apiKey });
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const client = new AssemblyAI({
    apiKey: 'a723b2f5bd894fe2bab3acbaa5466c10',
});
class QuackController {
    async index(request, res) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const { title, content } = request.body;

        // Generate a unique filename for the MP3 output
        const outputDir = path.join(__dirname, '..', 'output');
        const outputPath = path.join(outputDir, `${uuidv4()}.mp3`);

        // Check if the output directory exists, create it if not
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Generate the prompt for the generative model
        const prompt = `Faça um resumo sobre o assunto que direi a seguir, nao utilize nenhuma formatação, limite a 1800 caractere, enriqueça com mais informações buscadas na net sobre o assunto e monte algo interessante sobre o assunto. Não precisa enviar o título novamente, e nem um informe ***Resumo***.\n\n${content}`;

        // Generate content using the generative model
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Verificar se o texto tem mais de 4000 caracteres
        if (text.length > 4000) {
            // Solicitar um resumo
            const resumoPrompt = `O resumo gerado é muito extenso (${text.length} caracteres). Por favor, forneça um resumo mais curto. """Texto: ${text}"""`;
            const resumoResult = await model.generateContent(resumoPrompt);
            text = resumoResult.response.text();
        }

        const blocosTexto = text.split(/(\*\*\*|\`\`\`)/);

        const pageProperties = {
            "icon": {
                "type": "emoji",
                "emoji": "☠️"
            },
            parent: { database_id: pageId },
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
            },
            "children": []
        };

        // Adicionando blocos de texto ao pageProperties
        blocosTexto.forEach((bloco, index) => {
            if (bloco.trim() !== '') { // Ignorar blocos vazios
                let objetoBloco = {
                    "object": "block",
                    "paragraph": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": bloco,
                                },
                            }
                        ],
                        "color": "default"
                    }
                };
                pageProperties.children.push(objetoBloco);
            }
        });

        try {
            // Create the page in Notion
            const response = await notion.pages.create(pageProperties);
            // Generate text response for success message
            const successResponse = await model.generateContent(`Baseado nesse título ${title}, me devolva uma mensagem de sucesso ao gravar o resumo no Notion. Responda como uma assistente virtual, sem informar o link.`);

            // Convert the text response to speech and save it as an MP3 file
            const gtts = new gTTS(successResponse.response.text(), 'pt', 'com.br');
            gtts.save(outputPath, async function (err, result) {
                if (err) { throw new Error(err); }
                fs.readFile(outputPath, function (err, audioData) {
                    if (err) {
                        console.error("Error reading audio file:", err);
                        res.status(500).json({ success: false, error: "Internal Server Error" });
                    } else {
                        // Envie a resposta JSON junto com o áudio como um anexo
                        res.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`
                        });
                        res.end(JSON.stringify({ success: true, url: response.url, audio: audioData.toString('base64'), title: response.properties.Name.title[0].text.content }));
                    }
                });
            });



        } catch (error) {
            console.error("Error creating page in Notion:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
    async audio(req, res) {
        const file = req.file;
        const diskStorage = new DiskStorage();
        try {
            const profileFilename = await diskStorage.saveFile(file.filename);
            const FILE_URL = `tmp/uploads/${profileFilename}`;
            const data = {
                audio_url: FILE_URL,
                language_code: 'pt'
            }
            const run = async () => {
                const transcript = await client.transcripts.create(data);
                res.send({ translate: transcript.text }).json().status(201);
                return await diskStorage.deleteFile(profileFilename);
            };
            run();
        } catch (error) {

        }
    }
}

module.exports = QuackController;
