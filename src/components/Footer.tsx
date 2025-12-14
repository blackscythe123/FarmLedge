import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Shield
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gradient-earth border-t border-border">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-lg">
                <Leaf className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-2xl">FarmLedge</h3>
                <p className="text-base text-muted-foreground">{t('footer.platform')}</p>
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <Badge className="bg-success/10 text-success border-success/20 text-base py-2 px-4">
              <Shield className="w-4 h-4 mr-2" />
              {t('hero.trust3')}
            </Badge>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="font-semibold text-lg">{t("footer.platform")}</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li><a href="/farmers" className="hover:text-foreground transition-colors font-medium">{t("nav.farmers")}</a></li>
              <li><a href="/distributors" className="hover:text-foreground transition-colors font-medium">{t("nav.distributors")}</a></li>
              <li><a href="/retailers" className="hover:text-foreground transition-colors font-medium">{t("nav.retailers")}</a></li>
              <li><a href="/consumers" className="hover:text-foreground transition-colors font-medium">{t("nav.consumers")}</a></li>
              
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-5">
            <h4 className="font-semibold text-lg">{t("footer.resources")}</h4>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/how-it-works" className="hover:text-foreground transition-colors font-medium">{t('nav.howItWorks')}</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground text-base">End-to-end flow</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">See how a batch moves across roles and how ownership is transferred on-chain by a verifier.</p>
                      <div className="font-mono text-sm bg-muted rounded p-3">
                        [Farmer] → [Distributor] → [Retailer] → [Consumer]
                      </div>
                      <div className="text-sm text-muted-foreground">Each step records prices in INR and the current holder.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/blockchain-guide" className="hover:text-foreground transition-colors font-medium">{t('nav.blockchainGuide')}</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground text-base">Provenance on-chain</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Understand blocks, immutability, and how ownership and price updates are attested.</p>
                      <div className="font-mono text-sm bg-muted rounded p-3">
                        [Block n-2] ─ [Block n-1] ─ [Block n]
                        {"\n"}                 \_ Ownership → Address
                      </div>
                      <div className="text-sm text-muted-foreground">Click through for simple concepts and visuals.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/fair-trade" className="hover:text-foreground transition-colors font-medium">{t('nav.fairTrade')}</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground text-base">Transparent pricing</div>
                      <p className="text-xs text-muted-foreground">See how prices are set and displayed at each stage.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                       ₹ Farmer → ₹ Dist → ₹ Retail
                      </div>
                      <div className="text-xs text-muted-foreground">Helps consumers verify margins and farmer earnings.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a
                      href="https://github.com/blackscythe123/FarmLedge#api-endpoints"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {t('nav.apiDocs')}
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Integrate with the platform</div>
                      <p className="text-xs text-muted-foreground">REST endpoints to read batches and trigger flows.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                        [Client] → GET /api/batches{"\n"}
                        [Server] → Contract (viem)
                      </div>
                      <div className="text-xs text-muted-foreground">Includes examples and response shapes.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/support" className="hover:text-foreground transition-colors">{t('nav.support')}</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Get help fast</div>
                      <p className="text-xs text-muted-foreground">Browse FAQs, guides, or contact our team.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                        [?] → Docs / Guides → Email
                      </div>
                      <div className="text-xs text-muted-foreground">We’ll help you troubleshoot and onboard.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.contact")}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contact@FarmLedge.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>SSN College, Tamil Nadu, India</span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="GitHub"
                aria-label="GitHub"
              >
                <a
                  href="https://github.com/blackscythe123/FarmLedge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">{t("nav.privacy")}</a>
            <a href="/terms" className="hover:text-foreground transition-colors">{t("nav.terms")}</a>
            <a href="/cookies" className="hover:text-foreground transition-colors">{t("nav.cookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;