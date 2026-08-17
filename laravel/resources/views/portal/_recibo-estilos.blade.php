@include('portal._recibo-fuente')

@page { margin: 30px 0; }
body { font-family: 'Helvetica', 'Arial', sans-serif; color: #0B1220; font-size: 12px; background: #F5F7FC; }
table { width: 100%; border-collapse: collapse; }

.recibo {
    width: 540px;
    margin: 0 auto;
    background: #FFFFFF;
    border: 1px solid #E1E7F5;
    border-radius: 14px;
}
.recibo + .recibo { page-break-before: always; }

.receipt-stamp {
    display: inline-block;
    border: 2.5px solid #16A34A;
    color: #16A34A;
    background: #E8F7EE;
    font-weight: bold;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 6px;
    transform: rotate(6deg);
}
.receipt-stamp.pendiente { border-color: #D97706; color: #D97706; background: #FDF1DF; }
.receipt-stamp.parcial { border-color: #2563EB; color: #2563EB; background: #E9F0FE; }

.receipt-head { padding: 26px 30px 18px; }
.receipt-head td { vertical-align: top; padding: 0; }
.mark {
    display: inline-block;
    width: 26px; height: 26px;
    background: #2563EB; color: #fff;
    text-align: center; line-height: 26px;
    font-weight: bold; font-size: 12px;
    border-radius: 7px;
}
.brand-name { font-size: 14px; font-weight: bold; margin: 0 0 0 6px; display: inline-block; vertical-align: middle; }
.brand-sub { font-size: 9.5px; color: #5B6478; margin: 4px 0 0; }
.doc-kind { font-size: 9px; font-weight: bold; letter-spacing: 1.2px; text-transform: uppercase; color: #2563EB; margin: 0; text-align: right; }
.folio { font-family: 'Fraunces', 'Times New Roman', Georgia, serif; font-style: italic; font-weight: bold; font-size: 18px; margin: 4px 0 2px; text-align: right; }
.emitted { font-size: 9.5px; color: #5B6478; margin: 0; text-align: right; }

.rule { border-top: 2px solid #0B1220; }

.parties-box { background: #EEF2FA; padding: 16px 30px; }
.parties-box td { padding: 0 12px 0 0; vertical-align: top; }
.p-label { font-size: 8.5px; font-weight: bold; text-transform: uppercase; color: #5B6478; letter-spacing: .6px; margin: 0 0 4px; }
.p-value { font-size: 12px; font-weight: bold; margin: 0; color: #0B1220; }
.p-meta { font-size: 9.5px; color: #5B6478; margin: 2px 0 0; }

.receipt-body { padding: 20px 30px 6px; }

.concepts { margin-bottom: 2px; }
.concepts th { text-align: left; font-size: 8.5px; text-transform: uppercase; color: #5B6478; letter-spacing: .5px; border-bottom: 1px solid #E1E7F5; padding: 0 0 8px; font-weight: bold; }
.concepts th.num { text-align: right; }
.concepts td { padding: 9px 0; border-bottom: 1px solid #E1E7F5; font-size: 10.5px; }
.concepts td.num { text-align: right; }
.concepts td.concept { font-weight: bold; }
.concepts td.detail { color: #5B6478; font-size: 9.5px; }

.debt-box { background: #FDF1DF; padding: 10px 14px; margin: 14px 0; border-radius: 10px; }
.debt-box table td { color: #D97706; font-size: 10.5px; font-weight: bold; }
.debt-box table td.r { text-align: right; }

.totals { width: 230px; margin-left: auto; margin-top: 6px; }
.totals td { padding: 5px 0; font-size: 10.5px; color: #5B6478; }
.totals td.r { text-align: right; }
.totals tr.grand td { border-top: 2px solid #0B1220; padding-top: 10px; color: #0B1220; font-size: 12px; font-weight: bold; }
.totals tr.grand td.r { font-family: 'Times New Roman', Georgia, serif; font-style: italic; font-weight: bold; font-size: 19px; }

.pay-box { background: #F1EBFC; padding: 12px 16px; margin-top: 18px; border-radius: 10px; }
.pay-box table td { vertical-align: middle; }
.pay-box .qr-mark {
    display: inline-block; width: 34px; height: 34px;
    border: 2.5px solid #6D28D9; border-radius: 8px;
    text-align: center; line-height: 30px;
    color: #6D28D9; font-weight: bold; font-size: 13px;
}
.pay-box .who { font-weight: bold; font-size: 10.5px; color: #0B1220; margin: 0; }
.pay-box .meta { font-size: 9.5px; color: #5B6478; margin: 2px 0 0; }

.footer { margin-top: 22px; padding: 14px 30px 22px; border-top: 1px solid #E1E7F5; font-size: 8.5px; color: #8891A6; line-height: 1.5; }
