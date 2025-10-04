import {
  Globe,
  Server,
  Database,
  Code,
  Phone,
  MessageSquare,
  BookOpen,
  Users,
  Shield,
  Zap,
  ShoppingCart,
  CreditCard,
  BarChart,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Mail,
  CheckCircle,
} from "lucide-react"
import { ReactNode } from "react"

export function getServiceIcon(name: string, className: string): ReactNode {
  switch (name) {
    case "Globe":
      return <Globe className={className} />
    case "Server":
      return <Server className={className} />
    case "Database":
      return <Database className={className} />
    case "Code":
      return <Code className={className} />
    case "Phone":
      return <Phone className={className} />
    case "MessageSquare":
      return <MessageSquare className={className} />
    case "BookOpen":
      return <BookOpen className={className} />
    case "ShoppingCart":
      return <ShoppingCart className={className} />
    case "CreditCard":
      return <CreditCard className={className} />
    case "Users":
      return <Users className={className} />
    case "BarChart":
      return <BarChart className={className} />
    case "FileText":
      return <FileText className={className} />
    case "Image":
      return <ImageIcon className={className} />
    case "Video":
      return <Video className={className} />
    case "Music":
      return <Music className={className} />
    case "Mail":
      return <Mail className={className} />
    default:
      return <Globe className={className} />
  }
}

export function getWhyChooseUsIcon(title: string, className: string): ReactNode {
  const lower = title.toLowerCase()
  if (lower.includes("calidad") || lower.includes("excelencia")) return <Shield className={className} />
  if (lower.includes("equipo") || lower.includes("profesional")) return <Users className={className} />
  if (lower.includes("rápido") || lower.includes("veloc") || lower.includes("ágil")) return <Zap className={className} />
  if (lower.includes("innovación") || lower.includes("tecnología")) return <Code className={className} />
  return <CheckCircle className={className} />
}
