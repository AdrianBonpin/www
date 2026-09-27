import type { Certificate } from "./types"

export const certificates: Certificate[] = [
  {
    name: "PhilNITS FE",
    issuer: "Philippine National IT Standards Foundation",
    year: 2026,
    url: "https://philnits.org/passers-fe/",
    description:
      "PhilNITS Fundamental Engineer (FE) — national IT certification covering software development fundamentals, algorithms, databases, and system design.",
    status: "passed",
  },
  {
    name: "Cybersecurity Essentials",
    issuer: "Cisco Networking Academy",
    year: 2024,
    url: "/certificates/cybersecurity-essentials.pdf",
    description:
      "Foundational security concepts — cryptography, access control, firewalls, cloud security, and defense-in-depth.",
    status: "awarded",
  },
  {
    name: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    year: 2024,
    url: "/certificates/introduction-to-cybersecurity.pdf",
    description:
      "Fundamentals of cybersecurity — common threats, vulnerabilities, attack types, and career paths in security.",
    status: "awarded",
  },
  {
    name: "CCNAv7: Switching, Routing, and Wireless Essentials",
    issuer: "Cisco Networking Academy",
    year: 2023,
    url: "/certificates/ccna-switching-routing-and-wireless-essentials.pdf",
    description:
      "VLANs, inter-VLAN routing, STP, EtherChannel, WLAN configuration, and dynamic routing with OSPF.",
    status: "awarded",
  },
  {
    name: "CCNAv7: Introduction to Networks",
    issuer: "Cisco Networking Academy",
    year: 2023,
    url: "/certificates/ccna-introduction-to-networks.pdf",
    description:
      "Network fundamentals — Ethernet, IPv4/IPv6 addressing, and basic router and switch configuration.",
    status: "awarded",
  },
]
