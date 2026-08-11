import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Award, CheckSquare, Wrench } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockServiceProviders } from '@/mock-data/service-providers';
import { EmptyState } from '@/components/shared/States';

export default function ServiceProviderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const provider = mockServiceProviders.find((p) => p.id === id);

  if (!provider) {
    return (
      <div className="space-y-6">
        <PageHeader title="Provider Not Found" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Service Providers', href: '/service-providers' }, { label: 'Error' }]} />
        <EmptyState
          title="Service Provider profile not found"
          description="The requested service provider ID does not exist or may have been suspended."
          action={
            <Link
              to="/service-providers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Service Providers list
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/service-providers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service Providers list
        </button>
        <PageHeader
          title={provider.name}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service Providers', href: '/service-providers' },
            { label: provider.name }
          ]}
          action={
            <div className="text-xs font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
              Status: {provider.status.toUpperCase()}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground leading-snug">{provider.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">{provider.id}</span>
              </div>
            </div>

            <div className="border-t border-border/60 my-2" />

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification status:</span>
                <StatusBadge status={provider.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expertise Category:</span>
                <span>{provider.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Work Experience:</span>
                <span>{provider.experienceYears} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider Rating:</span>
                <span className="font-bold">★ {provider.rating} / 5.0</span>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3.5 text-xs font-semibold">
            <h4 className="text-[10px] font-bold text-foreground tracking-wider uppercase">Contact Information</h4>
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="break-all">{provider.email}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{provider.phone}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="leading-relaxed text-muted-foreground">{provider.address}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Services Offered summary (view-only) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
              <Wrench className="h-4.5 w-4.5 text-primary" />
              Services Offered Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {provider.servicesOffered.map((service, idx) => (
                <div
                  key={idx}
                  className="border border-border/80 bg-background rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="p-1.5 bg-primary/10 text-primary rounded border border-primary/20 shrink-0">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-foreground block">{service}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Platform Verified service</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity / Performance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-[10px] font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
                <Award className="h-4 w-4 text-info" />
                Service Reputation
              </h4>
              <p className="text-2xl font-black text-info font-mono">★ {provider.rating}</p>
              <p className="text-xs text-muted-foreground">Aggregated customer review score across completed tasks</p>
            </div>
            <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-[10px] font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                Completed Tasks
              </h4>
              <p className="text-2xl font-black text-primary font-mono">42 Tasks</p>
              <p className="text-xs text-muted-foreground">Total platform assignments successfully resolved</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
