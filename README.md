# Kenya Connect & Explore

Below is a comprehensive requirements prompt you can give to an AI coding agent. It is tailored specifically for the Kenyan tourism industry.

Project Title

SafariConnect Kenya – Tour Operator CRM & Customer Lead Marketplace

Project Overview

Develop a modern, scalable web application that connects travelers looking to visit Kenya with licensed Kenyan tour operators.

The platform should function as both:

A customer-facing marketplace where travelers submit travel requests and compare quotations.

A CRM for tour operators to manage leads, quotations, customers, bookings, payments, and communication.

The platform owner (Admin) controls subscriptions, verifies operators, manages content, and monitors the entire ecosystem.

Initially, customers use the platform free of charge.

Only tour operators pay to access leads and use the CRM.

The pricing model should be configurable later from the admin panel.

The system should be designed to eventually expand to East Africa but initially focuses exclusively on Kenya.

Technology Stack

Frontend: React + TypeScript

Backend: Node.js (Express or NestJS)

Database: PostgreSQL

Authentication: JWT

File Storage: Cloud Storage

Maps: Google Maps

Email: SMTP

SMS: Africa's Talking

Payments:

M-Pesa

Card payments

Deployment:

Docker

Nginx

Linux Server

Architecture should support thousands of operators and millions of customers.

User Roles

1. Super Admin

Full system access.

Can:

Manage subscriptions

Verify operators

Suspend operators

Delete accounts

View analytics

Manage destinations

Manage counties

Manage parks

Manage packages

View all bookings

View payments

View leads

Manage homepage

Manage blogs

Manage FAQs

Configure commission

Configure subscription pricing

Configure payment gateways

Configure email templates

Configure SMS templates

Manage advertisements

Send announcements

View audit logs

2. Tour Operator

Must register.

Registration requires:

Company Name

Business Registration Number

KRA PIN

KATO Membership (optional)

Tourism Regulatory Authority (TRA) License Number

County

Physical Address

Google Maps Location

Contact Person

Email

Phone Number

WhatsApp Number

Website

Company Logo

Company Cover Image

Company Description

Years in Business

Number of Employees

Languages Spoken

Vehicle Types

Safari Specialties

Tour Categories

Operator remains Pending until Admin approves.

Operator Dashboard

Dashboard should show:

New Leads

Active Leads

Won Leads

Lost Leads

Bookings

Revenue

Subscription Status

Messages

Notifications

Tasks

Calendar

CRM Features

Lead Management

Each lead contains:

Customer details

Destination

Dates

Number of adults

Number of children

Budget

Nationality

Pickup location

Preferred hotels

Preferred transport

Special requests

Operator can:

Assign Lead

Change Status

Add Notes

Schedule Follow-up

Create Tasks

Mark Won

Mark Lost

Archive

Search

Filter

Export

Quotation Builder

Operator should build quotations.

Quotation includes:

Accommodation

Transport

Park Fees

Meals

Activities

Guide Fees

Vehicle Costs

Taxes

Discount

Markup

Total Cost

PDF Generation

Email Quote

WhatsApp Quote

Version History

Approval Tracking

Booking Management

Convert quotation into booking.

Manage:

Travel dates

Travelers

Hotels

Flights

Transfers

Safari Vehicles

Guides

Drivers

Payments

Balance

Receipts

Invoices

Travel Documents

Customer CRM

Store:

Passport

Nationality

Phone

Email

Past Trips

Preferences

Travel History

Favorite Destinations

Notes

Documents

Communication History

Task Management

Create:

Tasks

Reminders

Calendar

Follow-ups

Notifications

Messaging

Internal messaging

Email

SMS

WhatsApp integration

Chat history

Reports

Revenue

Bookings

Lead conversion

Monthly sales

Popular destinations

Top customers

Quotation success rate

Customer Portal

Customers register using:

Google

Email

Phone

OTP verification

Customer Profile

Name

Nationality

Country

Phone

Email

Travel interests

Preferred language

Travel history

Saved trips

Wishlist

Customer Trip Request

Customer fills form:

Destination

Travel Dates

Flexible Dates

Adults

Children

Budget

Accommodation Type

Transport Preference

Luxury Level

Activities

Special Needs

Dietary Requirements

Nationality

Arrival Airport

Pickup Location

Additional Notes

Upload Supporting Documents

Lead Distribution

Admin can configure:

Send lead to:

Nearest operator

Premium subscribers

Random operators

Top-rated operators

County operators

Destination specialists

Maximum operators per lead

Lead expiry time

Customer Dashboard

View quotations

Compare quotations

Accept quotation

Reject quotation

Booking history

Messages

Invoices

Payments

Notifications

Saved destinations

Wishlist

Reviews

Marketplace

Homepage includes:

Search bar

Featured Safaris

Popular Destinations

National Parks

Beach Holidays

Mountain Climbing

Family Tours

Luxury Safaris

Budget Safaris

Group Tours

Corporate Retreats

Weekend Getaways

Honeymoons

Camping

Bird Watching

Cultural Tours

Photography Tours

Adventure Tours

Destination Pages

Each destination has:

Description

Photos

Videos

Location

Weather

Best Season

Activities

Nearby Hotels

Nearby Attractions

Suggested Packages

Operators Serving Destination

Reviews

Kenyan Destinations

Include:

Maasai Mara

Amboseli

Tsavo East

Tsavo West

Nairobi National Park

Lake Nakuru

Lake Naivasha

Hell's Gate

Samburu

Meru

Aberdare

Mount Kenya

Shimba Hills

Ruma

Saiwa Swamp

Marsabit

Watamu

Diani

Malindi

Lamu

Kisumu

Kakamega Forest

Turkana

Chalbi Desert

Mombasa

Nairobi

Nanyuki

Naivasha

Nakuru

Eldoret

Nyeri

Isiolo

Loita Hills

and all major tourist attractions in Kenya.

Search Engine

Search by:

Destination

County

Price

Duration

Activities

Operator

Accommodation

Luxury level

Availability

Rating

Reviews

Customers can review:

Tour Operators

Packages

Hotels

Destinations

Guides

Drivers

Rating System

5-star ratings

Photo uploads

Verified traveler badge

Helpful votes

Report abuse

Subscription System

Configurable from Admin.

Plans:

Free

Basic

Professional

Enterprise

Admin can configure:

Price

Lead limits

Storage

CRM access

Reports

Staff accounts

Package limits

Priority ranking

Premium badge

Featured listings

Payment Module

Support:

M-Pesa STK Push

M-Pesa Paybill

Visa

Mastercard

Receipts

Invoices

Subscription renewals

Automatic reminders

Failed payment handling

Notifications

Email

SMS

In-App

Push Notifications

Admin Analytics

Revenue

MRR

ARR

Operator growth

Customer growth

Lead conversion

Bookings

Most visited pages

Popular destinations

Operator performance

Subscription analytics

Payment analytics

Traffic analytics

Security

HTTPS

Role permissions

2FA (optional)

Audit logs

Encryption

Rate limiting

CAPTCHA

Backups

Session management

SEO

SEO-friendly URLs

Meta titles

Meta descriptions

Schema markup

Open Graph

Sitemap

Robots.txt

CMS

Admin should manage:

Homepage

About

Terms

Privacy

Destinations

Blogs

FAQs

Testimonials

Advertisements

Partners

Hero banners

Future Expansion

Architecture should support:

Hotels

Airlines

Travel Insurance

Car Hire

Boat Hire

Helicopter Tours

Event Tourism

Conference Tourism

Medical Tourism

Volunteer Tourism

Travel Agents

Affiliate Program

Mobile Apps

AI Trip Planner

AI Chat Assistant

Dynamic Pricing

Loyalty Program

Referral Program

Multi-country expansion (Uganda, Tanzania, Rwanda, Ethiopia)

UI/UX Requirements

Modern, clean, premium design inspired by Airbnb, Booking.com, and SafariBookings.

Fully responsive (mobile, tablet, desktop).

Fast loading with lazy loading and optimized images.

Dark mode and light mode support.

Accessible (WCAG-friendly) with clear typography and intuitive navigation.

Consistent branding and reusable components.

Non-Functional Requirements

Modular, maintainable codebase.

RESTful APIs with clear documentation.

Scalable architecture for future microservices.

Comprehensive logging and error handling.

Automated testing (unit and integration where appropriate).

Daily database backups.

High performance with efficient caching.

Multi-language ready (initially English, with support for adding Swahili later).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://safariconnectkenya.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b2ecc521-5c21-4dd3-9f7b-c66628b51c1f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
