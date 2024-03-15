import XLSX from "xlsx";
import {  setAttributesAtDocument, readSheet, readFiles, removeExtesion, addExtensionToArchive} from "./src/modules/utils/index.js";
import {  processUnitaryFiles,  processFullFolder} from "./src/modules/process/index.js";
import { getAccessToken } from "./src/modules/auth/index.js";

const mainDirectory = "Files";
const directory = "";

// NO FINAL DO README.md EXISTEM ALGUNS TRECHOS DE CÓDIGO "QUICK START" PARA FACILITAR ALGUMAS AÇÕES :)

const extensionsToRemove = [
  "docx",
  "png",
  "cfb",
  "rar",
  "zip",
  "jpg",
  "xlsx",
  "7z",
  "pptx",
  "opus",
  "odt",
  "pdf",
  "json",
];
